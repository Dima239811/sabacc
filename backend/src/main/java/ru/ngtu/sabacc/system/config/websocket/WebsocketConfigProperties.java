package ru.ngtu.sabacc.system.config.websocket;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties("websocket")
public class WebsocketConfigProperties {
    private Stomp stomp;
    private Game game;
    private Broker broker;
    private boolean logging = false;

    @Data
    public static class Stomp {
        private String endpoint = "/ws";
        private String allowedOrigin;
        private String allowedOriginPatterns;
        private boolean sockJsEnabled = true;
    }

    @Data
    public static class Game {
        private String endpoint = "/game";
        private String allowedOrigin;
        private String allowedOriginPatterns;
        private boolean sockJsEnabled = true;
    }

    @Data
    public static class Broker {
        private String[] destinationPrefixes;
        private String[] applicationDestinationPrefixes;
        private String userDestinationPrefixes;
    }
}