package ru.ngtu.sabacc.system.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.ngtu.sabacc.game.session.factory.IGameSessionFactory;
import ru.ngtu.sabacc.game.session.factory.mock.MockGameSessionFactory;

/**
 * @author Egor Bokov
 */
@Configuration
public class GameConfig {

    @Bean
    @ConditionalOnMissingBean(IGameSessionFactory.class)
    public IGameSessionFactory mockGameSessionFactory() {
        return new MockGameSessionFactory();
    }
}
