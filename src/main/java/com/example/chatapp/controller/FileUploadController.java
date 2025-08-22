package com.example.chatapp.controller;

import com.example.chatapp.model.UserRestrictions;
import com.example.chatapp.service.FileStorageService;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Map;

@Controller
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/upload")
    public String uploadPage(HttpSession session) {
        if (session.getAttribute("user") == null) {
            return "redirect:/login";
        }
        return "upload";
    }

    @PostMapping("/upload")
    @ResponseBody
    public ResponseEntity<Map<String, String>> handleUpload(@RequestParam("file") MultipartFile file,
                                                            HttpSession session) {
        if (session.getAttribute("user") == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        // Retrieve or create UserRestrictions for this session
        UserRestrictions restrictions = (UserRestrictions) session.getAttribute("restrictions");
        if (restrictions == null) {
            restrictions = new UserRestrictions();
            session.setAttribute("restrictions", restrictions);
        }

        Instant now = Instant.now();
        Instant lastUpload = restrictions.getLastFileUpload();

        // Enforce 10-minute (600 seconds) timeout between uploads
        if (lastUpload != null && now.isBefore(lastUpload.plusSeconds(600))) {
            long secondsLeft = lastUpload.plusSeconds(600).getEpochSecond() - now.getEpochSecond();
            return ResponseEntity.status(429).body(Map.of("error", "Please wait " + secondsLeft + " seconds before uploading again"));
        }

        try {
            Map<String, String> result = fileStorageService.storeFile(file);
            restrictions.setLastFileUpload(now); // Record upload time
            return ResponseEntity.ok(Map.of(
                    "downloadUrl", "/download/" + result.get("id"),
                    "password", result.get("password")
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process file"));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable String id) {
        return fileStorageService.retrieveFile(id);
    }
}
