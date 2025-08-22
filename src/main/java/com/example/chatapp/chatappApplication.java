package com.example.chatapp;

import com.example.chatapp.util.EncryptionUtil; 
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class chatappApplication {
    public static void main(String[] args) {
        EncryptionUtil.initializeKey(); 
        SpringApplication.run(chatappApplication.class, args);
    }
}
