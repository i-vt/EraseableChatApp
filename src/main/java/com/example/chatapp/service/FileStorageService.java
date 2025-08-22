package com.example.chatapp.service;

import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.model.enums.EncryptionMethod;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FileStorageService {

    private record StoredFile(byte[] original, String filename, String password, Instant uploadedAt) {}

    private final Map<String, StoredFile> storage = new ConcurrentHashMap<>();

    public void dropAll() {
        storage.clear();
    }

    public Map<String, String> storeFile(MultipartFile file) throws Exception {
        String id = UUID.randomUUID().toString();
        String password = generatePassword();

        storage.put(id, new StoredFile(
                file.getBytes(),
                file.getOriginalFilename(),
                password,
                Instant.now()
        ));

        return Map.of("id", id, "password", password);
    }

    public ResponseEntity<Resource> retrieveFile(String id) {
        StoredFile stored = storage.remove(id); // single-use access
        if (stored == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            // Create temp ZIP file
            File tempFile = File.createTempFile("upload-", ".zip");
            ZipFile zipFile = new ZipFile(tempFile, stored.password.toCharArray());

            ZipParameters parameters = new ZipParameters();
            parameters.setEncryptFiles(true);
            parameters.setEncryptionMethod(EncryptionMethod.AES);

            // Create inner file with original content
            File innerFile = File.createTempFile("inner-", ".bin");
            try (FileOutputStream fos = new FileOutputStream(innerFile)) {
                fos.write(stored.original);
            }
            zipFile.addFile(innerFile, parameters);

            // Create filename.txt file containing the original filename
            File filenameFile = File.createTempFile("filename-", ".txt");
            try (FileOutputStream fos = new FileOutputStream(filenameFile)) {
                fos.write(stored.filename.getBytes());
            }
            zipFile.addFile(filenameFile, parameters);

            // Read zip file into byte array
            byte[] zipBytes = java.nio.file.Files.readAllBytes(tempFile.toPath());

            // Clean up temporary files
            innerFile.delete();
            filenameFile.delete();
            tempFile.delete();

            ByteArrayResource resource = new ByteArrayResource(zipBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"encrypted.zip\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(zipBytes.length)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Scheduled(fixedRate = 86400000) // every 24 hours
    public void cleanupExpired() {
        Instant now = Instant.now();
        storage.entrySet().removeIf(e -> e.getValue().uploadedAt.plusSeconds(864000).isBefore(now));
    }

    private String generatePassword() {
        byte[] buf = new byte[8];
        new SecureRandom().nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }
}
