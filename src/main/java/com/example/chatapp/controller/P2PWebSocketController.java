package com.example.chatapp.controller;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;

@Controller
public class P2PWebSocketController {

    @MessageMapping("/p2p/{sessionId}/file")
    @SendTo("/topic/p2p/{sessionId}")
    public String relayFile(@DestinationVariable String sessionId, String filePayload) {
        return filePayload;
    }
}
