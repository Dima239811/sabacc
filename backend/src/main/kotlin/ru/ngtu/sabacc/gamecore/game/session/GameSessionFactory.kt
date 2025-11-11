package ru.ngtu.sabacc.gamecore.game.session

import org.springframework.stereotype.Component
import ru.ngtu.sabacc.game.messaging.IGameMessageExchanger
import ru.ngtu.sabacc.game.messaging.IGameSession
import ru.ngtu.sabacc.game.session.factory.IGameSessionFactory

@Component
object GameSessionFactory : IGameSessionFactory {
    override fun createSession(messageExchanger: IGameMessageExchanger, sessionId: Long, playerFirstId: Long, playerSecondId: Long): IGameSession {
        return GameSession(sessionId, playerFirstId, playerSecondId, messageExchanger)
    }
}
