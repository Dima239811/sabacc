package ru.ngtu.sabacc.gamecore.game

import lombok.Data

@Data
class GameErrorDto(
    val sessionId: Long? = null,
    val playerId: Long? = null,
    val errorType: GameErrorType? = null,
    val details: Map<String, Any>? = null
)
