package ru.ngtu.sabacc;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;


@SpringBootApplication
public class SabaccApplication {
    private static final Logger log = LoggerFactory.getLogger(SabaccApplication.class);

    public static void main(String[] args) {
        log.info("main в бэкенде запущен");
        SpringApplication.run(SabaccApplication.class, args);
    }

    @Bean
    public CommandLineRunner printEndpoints(ApplicationContext ctx) {
        return args -> {
            log.info("Команда для вывода эндпоинтов запускается");

            String[] beans = ctx.getBeanNamesForType(RequestMappingHandlerMapping.class);
            for (String beanName : beans) {
                RequestMappingHandlerMapping mapping = ctx.getBean(beanName, RequestMappingHandlerMapping.class);
                mapping.getHandlerMethods().forEach((requestMappingInfo, handlerMethod) -> {
                    log.info("{} : {}", requestMappingInfo, handlerMethod);
                });
            }
        };
    }



}
