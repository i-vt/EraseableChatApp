package com.example.chatapp.controller;

import com.example.chatapp.service.SharedSecretService;
import com.example.chatapp.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    private final UserService userService;
    private final SharedSecretService sharedSecretService;

    public AuthController(UserService userService, SharedSecretService sharedSecretService) {
        this.userService = userService;
        this.sharedSecretService = sharedSecretService;
    }

    @GetMapping("/login")
    public String loginForm(HttpSession session, Model model) {
        if (session.getAttribute("user") != null) {
            return "redirect:/dashboard";
        }
        model.addAttribute("disableSessionCheck", true);
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(@RequestParam String username,
                               @RequestParam String password,
                               HttpSession session,
                               HttpServletResponse response,
                               Model model) {

        if (userService.authenticate(username, password)) {
            session.setAttribute("user", username);
            userService.loginUser(username);

            // Issue chat key cookie if needed
            if (!userService.hasReceivedKey(username) && sharedSecretService.isKeyAvailable()) {
                Cookie cookie = new Cookie("chatKey", sharedSecretService.getSharedKey());
                cookie.setPath("/");
                cookie.setMaxAge(31536000); // 1 year
                cookie.setHttpOnly(false); // Allow client-side JS to access it if needed
                response.addCookie(cookie);
                userService.markKeyIssued(username);
            }

            return "redirect:/dashboard";
        }

        model.addAttribute("error", "Invalid username or password/code");
        model.addAttribute("disableSessionCheck", true);
        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        String username = (String) session.getAttribute("user");
        if (username != null) {
            userService.logoutUser(username);
        }
        session.invalidate();
        return "redirect:/login";
    }

    @GetMapping("/session/check")
    @ResponseBody
    public String checkSession(HttpSession session) {
        return session.getAttribute("user") != null ? "OK" : "INVALID";
    }
}
