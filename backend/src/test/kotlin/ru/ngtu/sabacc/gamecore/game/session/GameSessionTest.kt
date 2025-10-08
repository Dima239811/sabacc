package ru.ngtu.sabacc.gamecore.game.session

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import ru.ngtu.sabacc.gamecore.game.messaging.MockGameMessageExchanger
import ru.ngtu.sabacc.gamecore.token.Token
import ru.ngtu.sabacc.gamecore.turn.TurnDto
import ru.ngtu.sabacc.gamecore.turn.TurnType

class GameSessionTest {
    private val sessionId: Long = 0
    private val firstPlayerId: Long = 0
    private val secondPlayerId: Long = 1
    private val gameSession = GameSessionFactory.createSession(
        MockGameMessageExchanger(), sessionId, firstPlayerId, secondPlayerId
    )

    @Test
    fun testFullRound() {
        gameSession.start()

        println(gameSession.currentState)
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                firstPlayerId,
                TurnType.PLAY_TOKEN,
                mapOf("token" to Token.NO_TAX)
            )
        )
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                firstPlayerId,
                TurnType.GET_SAND
            )
        )

        println(gameSession.currentState)
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                firstPlayerId,
                TurnType.DISCARD_SAND,
                mapOf("index" to 1)
            )
        )

        println(gameSession.currentState)
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                secondPlayerId,
                TurnType.GET_BLOOD
            )
        )

        println(gameSession.currentState)
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                secondPlayerId,
                TurnType.DISCARD_BLOOD,
                mapOf("index" to 0)
            )
        )

        var objectMapper = ObjectMapper();
        val writeValueAsString = objectMapper.writer().writeValueAsString(gameSession.currentState)
        println("mappedValue" + writeValueAsString)

        println(gameSession.currentState)
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                firstPlayerId,
                TurnType.PASS
            )
        )

        println(gameSession.currentState)
        gameSession.tryMakeTurn(
            TurnDto(
                sessionId,
                secondPlayerId,
                TurnType.PASS
            )
        )
    }
}
