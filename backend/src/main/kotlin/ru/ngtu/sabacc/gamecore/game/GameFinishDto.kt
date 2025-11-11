package ru.ngtu.sabacc.gamecore.game

import lombok.Data

@Data
data class GameFinishDto(
    val sessionId: Long,
    val winnerId: Long
)
