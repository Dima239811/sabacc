package ru.ngtu.sabacc.system.config.user;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("user")
@Getter
@Setter
public class UserConfigProperties {
    private int expirationInHours = 1;
}