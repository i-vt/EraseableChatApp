package com.example.chatapp.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketSessionController {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketSessionController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastSessionInvalidation() {
        messagingTemplate.convertAndSend("/topic/session", "sessionInvalid");
    }
}
