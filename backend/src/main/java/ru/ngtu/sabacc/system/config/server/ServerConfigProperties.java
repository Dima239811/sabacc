package ru.ngtu.sabacc.system.config.server;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author Egor Bokov
 */
@Data
@ConfigurationProperties("server")
public class ServerConfigProperties {
    private String host;
    private String protocol;
}
