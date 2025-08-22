package com.example.chatapp.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@Controller
public class TutorialController {

    @GetMapping("/tutorial")
    public String tutorial(HttpSession session, Model model) {
        String username = (String) session.getAttribute("user");
        if (username == null) {
            return "redirect:/login";
        }

        // For Thymeleaf conditionals in the header
        model.addAttribute("session", Map.of("user", username));

        return "tutorial"; // templates/tutorial.html
    }
}
