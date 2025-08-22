package com.example.chatapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ProdErrorAttributes implements ErrorController {
 
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @RequestMapping("/error")
    public String handleError() {
        return switch (activeProfile) {
            case "dev" -> "error_dev";   // will render templates/error_dev.html
            case "prod" -> "error_prod"; // will render templates/error_prod.html
            default -> "error";          // fallback
        };
    }
}
