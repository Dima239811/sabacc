package ru.ngtu.sabacc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SabaccApplication {

    public static void main(String[] args) {
        System.out.println("main в бэкенде запущен");
        System.out.println("дописал только что");
        System.out.println("дописал");
        SpringApplication.run(SabaccApplication.class, args);
    }

}
