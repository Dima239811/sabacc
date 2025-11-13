package ru.ngtu.sabacc.gamecore.turn

import ru.ngtu.sabacc.gamecore.player.Player

data class DirectTransactionInfo (
    var firstPlayer: Player,
    var secondPlayer: Player,
)