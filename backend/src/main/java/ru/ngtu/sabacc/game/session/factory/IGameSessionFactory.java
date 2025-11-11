package ru.ngtu.sabacc.game.session.factory;

import ru.ngtu.sabacc.game.messaging.IGameMessageExchanger;
import ru.ngtu.sabacc.game.messaging.IGameSession;

/**
 * @author Egor Bokov
 */
public interface IGameSessionFactory {
    IGameSession createSession(IGameMessageExchanger messageExchanger, Long sessionId, Long playerFirstId, Long playerSecondId);
}
