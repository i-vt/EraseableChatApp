package com.example.chatapp.controller;

import com.example.chatapp.model.UserSessionInfo;
import com.example.chatapp.service.UserService;
import com.example.chatapp.service.SharedSecretService;
import com.example.chatapp.repository.RegistrationCodeRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collection;
import java.util.List;

@Controller
public class DashboardController {

    private final UserService userService;
    private final SharedSecretService sharedSecretService;
    private final RegistrationCodeRepository registrationCodeRepository;

    public DashboardController(UserService userService, SharedSecretService sharedSecretService, RegistrationCodeRepository registrationCodeRepository) {
        this.userService = userService;
        this.sharedSecretService = sharedSecretService;
        this.registrationCodeRepository = registrationCodeRepository;
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
        model.addAttribute("session", java.util.Map.of("user", username));

        return "dashboard";
    }

    @PostMapping("/revoke-code")
    public String revokeCode(@RequestParam String code, HttpSession session, Model model) {
        String username = (String) session.getAttribute("user");
        if (username == null) {
            return "redirect:/login";
        }

        String trimmedCode = code.trim();
        
        if (trimmedCode.isEmpty()) {
            model.addAttribute("error", "Please enter a valid registration code.");
            return dashboard(session, model);
        }

        if (registrationCodeRepository.existsById(trimmedCode)) {
            registrationCodeRepository.deleteById(trimmedCode);
            model.addAttribute("success", "Registration code revoked: " + trimmedCode);
            
            // Clear shared key if no codes remain
            if (registrationCodeRepository.count() == 0) {
                sharedSecretService.clearSharedKey();
                model.addAttribute("success", "Registration code revoked: " + trimmedCode + ". No codes remaining - shared key cleared.");
            }
        } else {
            model.addAttribute("error", "Registration code '" + trimmedCode + "' not found.");
        }

        return dashboard(session, model);
    }

    @PostMapping("/expire-codes")
    public String expireAllCodes(HttpSession session, Model model) {
        String username = (String) session.getAttribute("user");
        if (username == null) {
            return "redirect:/login";
        }

        long deletedCount = registrationCodeRepository.count();
        
        if (deletedCount == 0) {
            model.addAttribute("error", "No registration codes to expire.");
            return dashboard(session, model);
        }
        
        registrationCodeRepository.deleteAll();
        sharedSecretService.clearSharedKey();
        
        model.addAttribute("success", "Expired all " + deletedCount + " registration code(s). Shared key cleared.");
        return dashboard(session, model);
    }
}
