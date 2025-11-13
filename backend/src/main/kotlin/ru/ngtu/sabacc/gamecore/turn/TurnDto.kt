package ru.ngtu.sabacc.gamecore.turn

import lombok.Data

@Data
data class TurnDto(
    val sessionId: Long,
    val playerId: Long,
    val turnType: TurnType,
    var details: MutableMap<String, Any>? = null
)