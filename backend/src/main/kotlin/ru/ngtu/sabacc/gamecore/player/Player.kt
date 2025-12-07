package ru.ngtu.sabacc.gamecore.player

import lombok.Data
import ru.ngtu.sabacc.gamecore.card.Card
import ru.ngtu.sabacc.gamecore.token.Token

@Data
data class Player(
    val playerId: Long,
    val tokens: MutableList<Token> = mutableListOf(
        Token.NO_TAX,
        Token.TAKE_TWO_CHIPS,
        Token.OTHER_PLAYERS_PAY_ONE,
        Token.EXTRA_REFUND,
        Token.EMBEZZLEMENT,
        Token.GENERAL_AUDIT,
        Token.IMMUNITY,
        Token.EXHAUSTION,
        Token.DIRECT_TRANSACTION,
        Token.IMPOSTERS_TO_SIX,
        Token.SYLOP_TO_ZERO,
        Token.COOK_THE_BOOKS,
        Token.EMBARGO
    ),
    var remainChips: Int = 4,
    var spentChips: Int = 0,
    val bloodCards: MutableList<Card> = mutableListOf(),
    val sandCards: MutableList<Card> = mutableListOf(),
    var handRating: Pair<Int, Int>? = null,
    var isImmuneToTokens: Boolean = false,
    var isInPassState: Boolean = false
)
