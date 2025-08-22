package com.example.chatapp.controller;

import com.example.chatapp.model.UserRestrictions;
import com.example.chatapp.service.UserService;
import com.example.chatapp.util.DashboardHelper;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;

@Controller
public class UsernameController {

    private final UserService userService;
    private final DashboardHelper dashboardHelper;

    public UsernameController(UserService userService, DashboardHelper dashboardHelper) {
        this.userService = userService;
        this.dashboardHelper = dashboardHelper;
    }

    @PostMapping("/change-username")
    public String changeUsername(@RequestParam String newUsername,
                                 HttpSession session,
                                 Model model) {
        String currentUsername = (String) session.getAttribute("user");
        if (currentUsername == null) {
            return "redirect:/login";
        }

        Instant now = Instant.now();
        UserRestrictions restriction = userService.getUserRestrictions(currentUsername);
        Instant lastChange = restriction != null ? restriction.getLastUsernameChange() : null;

        // Check for cooldown period (10 minutes)
        if (lastChange != null && now.isBefore(lastChange.plus(Duration.ofMinutes(10)))) {
            long minutesLeft = Duration.between(now, lastChange.plus(Duration.ofMinutes(10))).toMinutes() + 1;
            model.addAttribute("error", "Please wait " + minutesLeft + " more minute(s) before changing your username again.");
            dashboardHelper.populateDashboardModel(model, session);
            return "dashboard";
        }

        boolean success = userService.changeUsername(currentUsername, newUsername);
        if (!success) {
            model.addAttribute("error", "That username is taken or invalid.");
            dashboardHelper.populateDashboardModel(model, session);
            return "dashboard";
        }

        session.setAttribute("user", newUsername);
        return "redirect:/dashboard";
    }
}
