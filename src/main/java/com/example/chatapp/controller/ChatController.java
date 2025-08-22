package com.example.chatapp.controller;

import com.example.chatapp.model.ChatMessage;
import com.example.chatapp.service.ChatService;
import com.example.chatapp.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping("/chat")
    public String chatPage(HttpSession session, Model model) {
        Object currentUser = session.getAttribute("user");
        if (currentUser == null) {
            return "redirect:/login";
        }

        model.addAttribute("messages", chatService.getAllMessages());

        List<String> usernames = userService.getAllUserSessions()
                .stream()
                .map(user -> user.getUsername()) // replace with correct method
                .collect(Collectors.toList());

        model.addAttribute("usernames", usernames);

        return "chat";
    }
}
