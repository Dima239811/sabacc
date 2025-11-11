package ru.ngtu.sabacc.game.session.factory.mock;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import ru.ngtu.sabacc.game.messaging.IGameMessageExchanger;
import ru.ngtu.sabacc.game.messaging.IGameSession;
import ru.ngtu.sabacc.game.session.factory.IGameSessionFactory;

/**
 * @author Egor Bokov
 */
@Slf4j
public class MockGameSessionFactory implements IGameSessionFactory {

    @PostConstruct
    public void init() {
        log.warn("Mock game session factory initialized");
    }

    @Override
    public IGameSession createSession(IGameMessageExchanger messageExchanger, Long sessionId, Long playerFirstId, Long playerSecondId) {
        return new MockGameSession(sessionId);
    }
}
