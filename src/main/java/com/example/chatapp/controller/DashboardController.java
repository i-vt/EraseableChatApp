package com.example.chatapp.controller;

import com.example.chatapp.model.UserSessionInfo;
import com.example.chatapp.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Collection;
import java.util.List;

@Controller
public class DashboardController {

    private final UserService userService;

    public DashboardController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        String username = (String) session.getAttribute("user");
        if (username == null) {
            return "redirect:/login";
        }

        Collection<UserSessionInfo> userSessions = userService.getAllUserSessions();
        List<String> activityLog = userService.getActivityLog();
        long codesLeft = userService.countUnusedRegistrationCodes();

        model.addAttribute("users", userSessions);
        model.addAttribute("activityLog", activityLog);
        model.addAttribute("codesLeft", codesLeft);
        model.addAttribute("session", java.util.Map.of("user", username)); // for Thymeleaf compatibility

        return "dashboard";
    }
}
