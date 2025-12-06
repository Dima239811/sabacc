package ru.ngtu.sabacc.gamecore.game

import lombok.Data

@Data
class GameErrorDto(
    val sessionId: Long? = null,
    val playerId: Long? = null,
    val errorType: GameErrorType? = null,
    val details: Map<String, Any>? = null



) {
    override fun toString(): String {
        return "GameErrorDto(sessionId=$sessionId, playerId=$playerId, errorType=$errorType, details=$details)"
    }

    fun getReadableMessage(): String {
        return when (errorType) {
            GameErrorType.WRONG_MOVE -> "Неверный ход. Доступные действия: ${details?.get("availableTurns")}"
            GameErrorType.NOT_YOUR_TURN -> "Сейчас не ваш ход!"
            GameErrorType.GAME_ON_PAUSE -> "Игра на паузе. Подождите возобновления."
            GameErrorType.NOT_ENOUGH_MONEY -> "Недостаточно средств для совершения действия."
            GameErrorType.TOKEN_NOT_FOUND -> "Жетон не найден или недоступен: ${details?.get("token")}"
            else -> "Произошла неизвестная ошибка"
        }
    }
}
