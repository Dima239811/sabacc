package ru.ngtu.sabacc.gamecore.turn

import lombok.Data

@Data
data class TurnDto(
    val sessionId: Long,
    val playerId: Long,
    val turnType: TurnType,
    val details: Map<String, Any>? = null
)
