package com.example.chatapp.controller;

import com.example.chatapp.repository.RegistrationCodeRepository;
import com.example.chatapp.service.ChatService;
import com.example.chatapp.service.FileStorageService;
import com.example.chatapp.service.UserService;
import com.example.chatapp.session.SessionRegistry;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class DropController {

    private final FileStorageService fileStorageService;
    private final UserService userService;
    private final RegistrationCodeRepository registrationCodeRepository;
    private final ChatService chatService;
    private final SessionRegistry sessionRegistry;
    private final WebSocketSessionController sessionWebSocketController;

    public DropController(FileStorageService fileStorageService,
                          UserService userService,
                          RegistrationCodeRepository registrationCodeRepository,
                          ChatService chatService,
                          SessionRegistry sessionRegistry,
                          WebSocketSessionController sessionWebSocketController) {
        this.fileStorageService = fileStorageService;
        this.userService = userService;
        this.registrationCodeRepository = registrationCodeRepository;
        this.chatService = chatService;
        this.sessionRegistry = sessionRegistry;
        this.sessionWebSocketController = sessionWebSocketController;
    }

    @GetMapping("/drop")
    public String confirmDrop(HttpSession session, Model model) {
        return "confirm_drop";
    }

    @PostMapping("/drop")
    public String executeDrop(HttpSession currentSession) {
        fileStorageService.dropAll();
        chatService.deleteAllMessages();
        userService.dropAllUsers();
        registrationCodeRepository.deleteAll();

        sessionRegistry.invalidateAll();
        sessionWebSocketController.broadcastSessionInvalidation(); // ✅ Broadcast to clients

        return "redirect:/login";
    }
}
