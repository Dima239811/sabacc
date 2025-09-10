package ru.ngtu.sabacc.gamecore.game

import lombok.Data
import ru.ngtu.sabacc.gamecore.player.Player

@Data
data class GameRoundDto(
    val round: Int,
    val players: List<Player>
)
