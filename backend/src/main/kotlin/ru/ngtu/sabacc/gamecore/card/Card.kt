package ru.ngtu.sabacc.gamecore.card

import lombok.Data

enum class CardValueType {
    IMPOSTER, SYLOP, VALUE_CARD
}

sealed interface Card {

    val cardValueType: CardValueType

    @Data
    data class ImposterCard(
        override val cardValueType: CardValueType = CardValueType.IMPOSTER
    ) : Card

    @Data
    data class SylopCard(
        override val cardValueType: CardValueType = CardValueType.SYLOP
    ) : Card

    @Data
    data class ValueCard(
        val value: Int,
        override val cardValueType: CardValueType = CardValueType.VALUE_CARD
    ) : Card
}
