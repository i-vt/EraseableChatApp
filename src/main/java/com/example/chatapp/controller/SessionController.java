// SessionController.java
package com.example.chatapp.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SessionController {

    @GetMapping("/session-status")
    public ResponseEntity<?> getSessionStatus(HttpSession session) {
        boolean valid = session != null && session.getAttribute("user") != null;
        return ResponseEntity.ok().body(new SessionStatus(valid));
    }

    record SessionStatus(boolean isValid) {}
}
