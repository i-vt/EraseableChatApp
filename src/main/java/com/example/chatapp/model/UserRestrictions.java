package com.example.chatapp.model;

import java.time.Instant;

public class UserRestrictions {
    private Instant lastUsernameChange;
    private Instant lastFileUpload; 

    public Instant getLastUsernameChange() {
        return lastUsernameChange;
    }

    public void setLastUsernameChange(Instant lastUsernameChange) {
        this.lastUsernameChange = lastUsernameChange;
    }

    public Instant getLastFileUpload() {
        return lastFileUpload;
    }

    public void setLastFileUpload(Instant lastFileUpload) {
        this.lastFileUpload = lastFileUpload;
    }
}
