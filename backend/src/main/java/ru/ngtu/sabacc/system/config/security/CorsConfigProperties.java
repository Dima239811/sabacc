package ru.ngtu.sabacc.system.config.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @author Egor Bokov
 */
@Data
@ConfigurationProperties("security.cors")
public class CorsConfigProperties {
    private String allowedOrigin;
    private String allowedHeader = "*";
    private String allowedMethod = "*";
    private String configurationPattern = "/api/**";
}
