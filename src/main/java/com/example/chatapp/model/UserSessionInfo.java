package com.example.chatapp.model;

import java.time.Instant;

public class UserSessionInfo {
    private String username;
    private Instant lastOnlineUtc;
    private String status;

    public UserSessionInfo(String username, Instant lastOnlineUtc, String status) {
        this.username = username;
        this.lastOnlineUtc = lastOnlineUtc;
        this.status = status;
    }

    public String getUsername() { return username; }
    public Instant getLastOnlineUtc() { return lastOnlineUtc; }
    public String getStatus() { return status; }

    public void setStatus(String status) {
        this.status = status;
        this.lastOnlineUtc = Instant.now();
    }
}
