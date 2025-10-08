package ru.ngtu.sabacc.gamecore.game.session

import mu.KotlinLogging
import ru.ngtu.sabacc.game.messaging.IGameMessageExchanger
import ru.ngtu.sabacc.game.messaging.IGameSession
import ru.ngtu.sabacc.gamecore.card.Card
import ru.ngtu.sabacc.gamecore.game.*
import ru.ngtu.sabacc.gamecore.board.Board
import ru.ngtu.sabacc.gamecore.player.Player
import ru.ngtu.sabacc.gamecore.token.Token
import ru.ngtu.sabacc.gamecore.turn.TurnDto
import ru.ngtu.sabacc.gamecore.turn.TurnType
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit
import kotlin.math.min

private val logger = KotlinLogging.logger {  }

class GameSession(
    private val sessionId: Long,
    playerFirstId: Long,
    playerSecondId: Long,
    private val gameMessageExchanger: IGameMessageExchanger
) : IGameSession {

    private val players: MutableMap<Long, Player> = mutableMapOf(
        playerFirstId to Player(playerFirstId),
        playerSecondId to Player(playerSecondId)
    )
    private var playersIter = players.keys.iterator()
    private var currentPlayerId: Long = playersIter.next()
    private lateinit var board: Board
    private lateinit var waitingForMoveType: List<TurnType>
    private var turn: Int = 1
    private var round: Int = 1
    private var passCount: Int = 0
    private var cardPrice: Int = 1
    private var pause = false
    private var dice: Array<Int>? = null

    override fun start() {
        board = initGameBoard()
        waitingForMoveType = initWaitingForMoveType()

        for (player in players.values) {
            player.sandCards.add(
                board.sandDeck.removeLast()
            )
            player.bloodCards.add(
                board.bloodDeck.removeLast()
            )
        }
    }

    private fun initGameBoard(): Board {
        val sandDeck: MutableList<Card> = mutableListOf()
        val bloodDeck: MutableList<Card> = mutableListOf()
        val sandDiscardDeck: MutableList<Card> = mutableListOf()
        val bloodDiscardDeck: MutableList<Card> = mutableListOf()

        for (value in 1..6) {
            for (i in 1..3) {
                sandDeck.add(Card.ValueCard(value))
                bloodDeck.add(Card.ValueCard(value))
            }
        }

        for (i in 1..3) {
            sandDeck.add(Card.ImposterCard())
            bloodDeck.add(Card.ImposterCard())
        }

        sandDeck.add(Card.SylopCard())
        bloodDeck.add(Card.SylopCard())

        sandDeck.shuffle()
        bloodDeck.shuffle()

        return Board(
            sandDeck,
            bloodDeck,
            sandDiscardDeck,
            bloodDiscardDeck
        )
    }

    private fun initWaitingForMoveType(): List<TurnType> {
        return listOf(
            TurnType.PASS,
            TurnType.GET_SAND,
            TurnType.GET_BLOOD,
            TurnType.GET_SAND_DISCARD,
            TurnType.GET_BLOOD_DISCARD,
            TurnType.PLAY_TOKEN
        )
    }

    override fun pause() {
        pause = true
        // Pause turn timers
    }

    override fun unpause() {
        pause = false
        // Resume turn timers
    }

    override fun getCurrentState(): GameStateDto {
        return GameStateDto(
            currentPlayerId,
            round,
            board.bloodDiscardDeck.lastOrNull(),
            board.sandDiscardDeck.lastOrNull(),
            players.values.toList()
        )
    }

    override fun tryMakeTurn(turnDTO: TurnDto) {
        logger.debug { "Session $sessionId: Making $turnDTO" }

        val playerId = turnDTO.playerId
        val turnType = turnDTO.turnType

        if (pause) {
            logger.debug { "Session $sessionId error: Game on pause" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.GAME_ON_PAUSE
                ), this
            )
            return
        }
        if (playerId != currentPlayerId) {
            logger.debug { "Session $sessionId error: Player $playerId is making turn. But now it's the Player $currentPlayerId turn" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.NOT_YOUR_TURN
                ), this
            )
            return
        }
        if (turnType !in waitingForMoveType) {
            logger.debug { "Session $sessionId error: Player $playerId is making wrong move. Awaiting $waitingForMoveType" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.WRONG_MOVE
                ), this
            )
            return
        }

        when(turnType) {
            TurnType.PASS -> pass(turnDTO)
            TurnType.GET_SAND -> getSand(turnDTO)
            TurnType.GET_BLOOD -> getBlood(turnDTO)
            TurnType.GET_SAND_DISCARD -> getSandDiscard(turnDTO)
            TurnType.GET_BLOOD_DISCARD -> getBloodDiscard(turnDTO)
            TurnType.DISCARD_SAND -> discardSandCard(turnDTO)
            TurnType.DISCARD_BLOOD -> discardBloodCard(turnDTO)
            TurnType.PLAY_TOKEN -> playToken(turnDTO)
            TurnType.SELECT_DICE -> processImposterCard(turnDTO)
            else -> return
        }
    }

    override fun getSessionId(): Long {
        return sessionId
    }

    private fun pass(turnDTO: TurnDto) {
        logger.debug { "Session $sessionId: Player ${turnDTO.playerId} skipped his turn" }
        passCount++

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        nextState()
    }

    private fun getSand(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!

        if (!pay(player, cardPrice)) {
            logger.debug { "Session $sessionId error: Player $playerId can't pay for sand deck" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.NOT_ENOUGH_MONEY
                ), this
            )
            return
        }

        val card = board.sandDeck.removeLast()
        player.sandCards.add(card)

        logger.debug { "Session $sessionId: Player $playerId took a $card from sand deck" }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        waitingForMoveType = listOf(
            TurnType.DISCARD_SAND
        )
    }

    private fun getBlood(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!

        if (!pay(player, cardPrice)) {
            logger.debug { "Session $sessionId error: Player $playerId can't pay for blood deck" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.NOT_ENOUGH_MONEY
                ), this
            )
            return
        }

        val card = board.bloodDeck.removeLast()
        player.bloodCards.add(card)

        logger.debug { "Session $sessionId: Player $playerId took a $card from blood deck" }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        waitingForMoveType = listOf(
            TurnType.DISCARD_BLOOD
        )
    }

    private fun getSandDiscard(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!

        if (!pay(player, cardPrice)) {
            logger.debug { "Session $sessionId error: Player $playerId can't pay for sand discard" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.NOT_ENOUGH_MONEY
                ), this
            )
            return
        }

        val card = board.sandDiscardDeck.removeLast()
        player.sandCards.add(card)

        logger.debug { "Session $sessionId: Player $playerId took a $card from sand discard" }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        waitingForMoveType = listOf(
            TurnType.DISCARD_SAND
        )
    }

    private fun getBloodDiscard(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!

        if (!pay(player, cardPrice)) {
            logger.debug { "Session $sessionId error: Player $playerId can't pay for blood discard" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.NOT_ENOUGH_MONEY
                ), this
            )
            return
        }

        val card = board.bloodDiscardDeck.removeLast()
        player.bloodCards.add(card)

        logger.debug { "Session $sessionId: Player $playerId took a $card from blood discard" }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        waitingForMoveType = listOf(
            TurnType.DISCARD_BLOOD
        )
    }

    private fun discardSandCard(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!
        val index = turnDTO.details!!["index"] as Int
        val card = player.sandCards.removeAt(index)
        board.sandDiscardDeck.add(card)

        logger.debug { "Session $sessionId: Player $playerId threw $card in sand discard" }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        nextState()
    }

    private fun discardBloodCard(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!
        val index = turnDTO.details!!["index"] as Int
        val card = player.bloodCards.removeAt(index)
        board.bloodDiscardDeck.add(card)

        logger.debug { "Session $sessionId: Player $playerId threw $card in blood discard" }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        nextState()
    }

    private fun playToken(turnDTO: TurnDto) {
        val playerId = turnDTO.playerId
        val player = players[playerId]!!
        val token = Token.valueOf(turnDTO.details!!["token"] as String)
        if (token !in player.tokens) {
            logger.debug { "Session $sessionId error: Player $playerId doesn't have $token to play" }
            gameMessageExchanger.sendErrorMessage(
                GameErrorDto(
                    sessionId,
                    playerId,
                    GameErrorType.TOKEN_NOT_FOUND
                ), this
            )
            return
        }

        when(token) {
            Token.NO_TAX -> {
                player.tokens.remove(Token.NO_TAX)

                cardPrice = 0
                logger.debug { "Session $sessionId: Player $playerId used $token, now the card price is $cardPrice" }
            }
            Token.TAKE_TWO_CHIPS -> {
                player.tokens.remove(Token.TAKE_TWO_CHIPS)

                val minChips = min(player.spentChips, 2)
                player.remainChips += minChips
                player.spentChips -= minChips
                logger.debug { "Session $sessionId: Player $playerId used $token, $minChips returned from the bank" }
            }
            Token.OTHER_PLAYERS_PAY_ONE -> {
                player.tokens.remove(Token.OTHER_PLAYERS_PAY_ONE)

                for (opponent in players.values) {
                    if (opponent == player)
                        continue

                    val isPaid = pay(opponent, 1)
                    logger.debug { "Session $sessionId: Player $playerId used $token, opponent ${if (isPaid) "paid 1" else "can't pay, nothing happened"}" }
                }
            }
        }

        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)
        waitingForMoveType = listOf(
            TurnType.PASS,
            TurnType.GET_SAND,
            TurnType.GET_BLOOD,
            TurnType.GET_SAND_DISCARD,
            TurnType.GET_BLOOD_DISCARD
        )
    }

    private fun nextState() {
        logger.debug { "Session $sessionId: Player $currentPlayerId has finished his move" }

        waitingForMoveType = initWaitingForMoveType()
        cardPrice = 1

        if (playersIter.hasNext()) {
            currentPlayerId = playersIter.next()
            logger.debug { "Session $sessionId: Player $currentPlayerId is the current player" }
        }
        else {
            logger.debug { "Session $sessionId: Turn $turn is over" }
            nextTurn()
        }
    }

    private fun nextTurn() {
        playersIter = players.keys.iterator()
        currentPlayerId = playersIter.next()

        if (turn < 3 && passCount != players.size) {
            turn++
            passCount = 0
            logger.debug { "Session $sessionId: Starting next turn. Turn $turn" }
        }
        else {
            logger.debug { "Session $sessionId: Round $round is over, processing Imposter cards" }
            CompletableFuture.runAsync {
                TimeUnit.SECONDS.sleep(1)
                processImposterCard()
            }
        }
    }

    private fun processImposterCard(turnDTO: TurnDto? = null) {
        val player = players[currentPlayerId]!!
        val bloodCard = player.bloodCards.last()
        val sandCard = player.sandCards.last()

        when {
            bloodCard is Card.ImposterCard -> {
                if (turnDTO == null)
                    logger.debug { "Session $sessionId: Player $currentPlayerId blood card is Imposter card" }
                replaceImposterCard(turnDTO, player.bloodCards)
            }
            sandCard is Card.ImposterCard -> {
                if (turnDTO == null)
                    logger.debug { "Session $sessionId: Player $currentPlayerId sand card is Imposter card" }
                replaceImposterCard(turnDTO, player.sandCards)
            }
            else -> {
                if (playersIter.hasNext()) {
                    currentPlayerId = playersIter.next()
                    processImposterCard()
                }
                else {
                    logger.debug { "Session $sessionId: All Imposter cards has been processed" }
                    roundResults()
                }
            }
        }
    }

    private fun replaceImposterCard(turnDTO: TurnDto?, cards: MutableList<Card>) {
        if (turnDTO == null) {
            dice = arrayOf(
                (1..6).random(),
                (1..6).random()
            )

            waitingForMoveType = listOf(
                TurnType.SELECT_DICE
            )

            logger.debug { "Session $sessionId: Player $currentPlayerId need to pick a dice from $dice" }

            gameMessageExchanger.sendAcceptedTurn(
                TurnDto(
                    sessionId,
                    currentPlayerId,
                    TurnType.AWAITING_DICE,
                    mapOf(
                        "first" to dice!![0],
                        "second" to dice!![1]
                    )
                ), this
            )
            return
        }
        val index = turnDTO.details!!["index"] as Int
        val value = dice!![index]
        val imposterCard = cards.removeLast()
        val valueCard = Card.ValueCard(value)
        cards.add(valueCard)

        logger.debug { "Session $sessionId: Player $currentPlayerId chose index $index. $imposterCard is being replaced by $valueCard" }

        dice = null
        gameMessageExchanger.sendAcceptedTurn(turnDTO, this)

        CompletableFuture.runAsync {
            TimeUnit.SECONDS.sleep(1)
            processImposterCard()
        }
    }

    private fun roundResults() {
        logger.debug { "Session $sessionId: Round $round. Starting counting the results" }
        // Rate players hand
        for (player in players.values) {
            val sandCard = player.sandCards.removeLast()
            val bloodCard = player.bloodCards.removeLast()

            player.handRating = rateHand(sandCard, bloodCard)
            logger.debug { "Session $sessionId: Round $round. Player ${player.playerId} has hand rating of ${player.handRating}" }
        }

        val playersSortedByRating = players.values.sortedWith(compareBy(
            { it.handRating!!.first },
            { it.handRating!!.second }
        ))

        // Collect taxes
        val winner = playersSortedByRating.first()
        val winnerId = players.keys.find { players[it] == winner }!!
        winner.remainChips += winner.spentChips
        forcePay(winner, winner.handRating!!.first)

        logger.debug { "Session $sessionId: Round $round. Winner is Player ${winner.playerId}. He is paying ${winner.handRating!!.first}" }

        val looser = playersSortedByRating.last()
        if (looser.handRating!!.first == 0) {
            forcePay(looser, 1)

            logger.debug { "Session $sessionId: Round $round. Looser is Player ${looser.playerId}. He is paying 1" }
        }
        else {
            forcePay(looser, looser.handRating!!.first)

            logger.debug { "Session $sessionId: Round $round. Looser is Player ${looser.playerId}. He is paying ${looser.handRating!!.first}" }
        }

        CompletableFuture.runAsync {
            TimeUnit.SECONDS.sleep(1)

            gameMessageExchanger.sendRoundResults(
                GameRoundDto(round, playersSortedByRating), this
            )

            TimeUnit.SECONDS.sleep(1)

            winner.spentChips = 0
            looser.spentChips = 0

            // Show the winner
            if (looser.remainChips == 0) {
                logger.debug { "Session $sessionId: Round $round. Player ${looser.playerId} has been eliminated, session finished" }

                gameMessageExchanger.sendGameFinished(
                    GameFinishDto(sessionId, winnerId), this
                )
            }
            else {
                nextRound()
            }
        }
    }

    // Difference and strength of hand
    private fun rateHand(sandCard: Card, bloodCard: Card): Pair<Int, Int> {
        if (sandCard is Card.SylopCard &&
            bloodCard is Card.SylopCard)
            return Pair(0, 0)

        if (sandCard is Card.SylopCard &&
            bloodCard is Card.ValueCard) {
            return Pair(0, bloodCard.value)
        }

        if (bloodCard is Card.SylopCard &&
            sandCard is Card.ValueCard) {
            return Pair(0, sandCard.value)
        }

        val bloodCardCast = bloodCard as Card.ValueCard
        val sandCardCast = sandCard as Card.ValueCard

        val difference = Math.abs(bloodCardCast.value - sandCardCast.value)
        return Pair(difference, Math.max(bloodCardCast.value, sandCardCast.value))
    }

    private fun nextRound() {
        round++
        turn = 1
        playersIter = players.keys.iterator()
        currentPlayerId = playersIter.next()
        passCount = 0

        logger.debug { "Session $sessionId: Starting next round. Round $round" }

        start()
    }

    private fun pay(player: Player, price: Int): Boolean {
        if (player.remainChips < price)
            return false

        player.remainChips -= price
        player.spentChips += price
        return true
    }

    private fun forcePay(player: Player, price: Int) {
        val affordablePrice = Math.min(price, player.remainChips)
        player.remainChips -= affordablePrice
        player.spentChips += affordablePrice
    }
}
