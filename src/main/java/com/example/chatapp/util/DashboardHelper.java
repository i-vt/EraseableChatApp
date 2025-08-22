package com.example.chatapp.util;

import com.example.chatapp.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;

import java.util.Map;

@Component
public class DashboardHelper {

    private final UserService userService;

    public DashboardHelper(UserService userService) {
        this.userService = userService;
    }

    public void populateDashboardModel(Model model, HttpSession session) {
        String username = (String) session.getAttribute("user");
        model.addAttribute("users", userService.getAllUserSessions());
        model.addAttribute("activityLog", userService.getActivityLog());
        model.addAttribute("codesLeft", userService.countUnusedRegistrationCodes());
        model.addAttribute("session", Map.of("user", username));
    }
}
