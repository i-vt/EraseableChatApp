package com.example.chatapp.model;

import java.time.Instant;

public class ChatMessage {
    private String sender;
    private String content;
    private String iv;
    private Instant timestamp;

    public ChatMessage() {}

    public ChatMessage(String sender, String content, String iv) {
        this.sender = sender;
        this.content = content;
        this.iv = iv;
        this.timestamp = Instant.now(); // Default to now
    }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
