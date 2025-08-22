package com.example.chatapp.controller;

import com.example.chatapp.service.SharedSecretService;
import com.example.chatapp.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class RegistrationController {

    private final UserService userService;
    private final SharedSecretService sharedSecretService;

    public RegistrationController(UserService userService, SharedSecretService sharedSecretService) {
        this.userService = userService;
        this.sharedSecretService = sharedSecretService;
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("disableSessionCheck", true);
        return "register";
    }

    @PostMapping("/register")
    public String processRegistration(@RequestParam String code,
                                      @RequestParam String password,
                                      HttpSession session,
                                      HttpServletResponse response,
                                      Model model) {

        Optional<String> userOpt = userService.registerWithCode(code, password);
        if (userOpt.isPresent()) {
            String username = userOpt.get();
            session.setAttribute("user", username);
            userService.loginUser(username);

            if (sharedSecretService.isKeyAvailable()) {
                Cookie cookie = new Cookie("chatKey", sharedSecretService.getSharedKey());
                cookie.setPath("/");
                cookie.setMaxAge(31536000); // 1 year
                cookie.setHttpOnly(false); // Allow client-side access if needed
                response.addCookie(cookie);
                userService.markKeyIssued(username);
            }

            return "redirect:/dashboard";
        } else {
            model.addAttribute("error", "Invalid or already used code.");
            model.addAttribute("disableSessionCheck", true);
            return "register";
        }
    }
}
