package com.example.chatapp.controller;

import com.example.chatapp.model.ChatMessage;
import com.example.chatapp.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.Instant;
import java.util.Map;


@Controller
public class WebSocketChatController {
    private final ChatService chatService;

    public WebSocketChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.sendChunk")
    @SendTo("/topic/public")
    public Map<String, Object> sendChunk(Map<String, Object> msg) {
        msg.put("timestamp", Instant.now().toString());
        return msg;
    }
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public Map<String, Object> sendMessage(Map<String, Object> msg) {
        msg.put("timestamp", Instant.now().toString());

        // Persist to database
        String sender = (String) msg.get("sender");
        String content = (String) msg.get("content");
        String iv = (String) msg.get("iv");

        ChatMessage chatMessage = new ChatMessage(sender, content, iv);
        chatService.store(chatMessage);

        return msg;
    }



}
