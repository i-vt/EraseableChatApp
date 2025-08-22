package com.example.chatapp.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

@Controller
public class P2PController {

    @GetMapping("/p2p")
    public String redirectToRandomSession() {
        String sessionId = UUID.randomUUID().toString();
        return "redirect:/p2p/" + sessionId;
    }

    @GetMapping("/p2p/{sessionId}")
    public String p2pSession(@PathVariable String sessionId, HttpServletRequest request, Model model, HttpSession session) {
        if (session.getAttribute("user") == null) {
            return "redirect:/login";
        }

        String fullUrl = request.getRequestURL().toString(); // e.g., http://localhost:8080/p2p/xyz
        model.addAttribute("sessionId", sessionId);
        model.addAttribute("sessionUrl", fullUrl);
        return "p2p";
    }

}
