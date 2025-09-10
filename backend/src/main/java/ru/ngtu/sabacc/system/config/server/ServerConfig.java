package ru.ngtu.sabacc.system.config.server;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author Egor Bokov
 */
@Configuration
@EnableConfigurationProperties(ServerConfigProperties.class)
public class ServerConfig {
}
