package ru.ngtu.sabacc.system.config.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import ru.ngtu.sabacc.ws.GameHandshakeInterceptor;

/**
 * @author Egor Bokov
 */
@Configuration
@EnableConfigurationProperties(WebsocketConfigProperties.class)
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebsocketConfigProperties websocketConfigProperties;
    private final GameHandshakeInterceptor gameHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry
                .enableSimpleBroker(websocketConfigProperties
                .getBroker().getDestinationPrefixes()
                )
                .setHeartbeatValue(new long[]{10000, 10000}) // Настройка heartbeat (в миллисекундах)
                .setTaskScheduler(heartbeatScheduler());
        registry.setApplicationDestinationPrefixes(websocketConfigProperties
                .getBroker().getApplicationDestinationPrefixes());
        registry.setUserDestinationPrefix(websocketConfigProperties
                .getBroker().getUserDestinationPrefixes());
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        StompWebSocketEndpointRegistration stompWebSocketEndpointRegistration = registry
                .addEndpoint(websocketConfigProperties
                        .getStomp().getEndpoint())
                .setAllowedOrigins(websocketConfigProperties
                        .getStomp().getAllowedOrigin())
                .setAllowedOriginPatterns(websocketConfigProperties
                        .getStomp().getAllowedOriginPatterns());

        if(websocketConfigProperties.getStomp().isSockJsEnabled())
            stompWebSocketEndpointRegistration.withSockJS();

        StompWebSocketEndpointRegistration gameWebSocketEndpointRegistration = registry
                .addEndpoint(
                    websocketConfigProperties.getGame().getEndpoint()
                )
                .addInterceptors(gameHandshakeInterceptor)
                .setAllowedOrigins(websocketConfigProperties
                        .getGame().getAllowedOrigin())
                .setAllowedOriginPatterns(websocketConfigProperties
                        .getGame().getAllowedOriginPatterns());

        if(websocketConfigProperties.getGame().isSockJsEnabled())
            gameWebSocketEndpointRegistration.withSockJS();
    }

    private ThreadPoolTaskScheduler heartbeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("wss-heartbeat-thread-");
        scheduler.initialize();
        return scheduler;
    }
}
