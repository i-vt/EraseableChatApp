package com.example.chatapp.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class SharedSecretService {

    private String sharedKey;

    public SharedSecretService() {
        generateNewKey();
    }

    public synchronized String getSharedKey() {
        return sharedKey;
    }

    public synchronized void clearSharedKey() {
        this.sharedKey = null;
    }

    public synchronized boolean isKeyAvailable() {
        return sharedKey != null;
    }

    public synchronized void generateNewKey() {
        byte[] keyBytes = new byte[32]; // 256-bit AES
        new SecureRandom().nextBytes(keyBytes);
        this.sharedKey = Base64.getEncoder().encodeToString(keyBytes);
    }
}

