package com.example.chatapp.entity;

import jakarta.persistence.*;

@Entity
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;

    @Lob
    private String content; // Base64 encrypted message

    private String iv; // Base64 IV

    public ChatMessageEntity() {}

    public ChatMessageEntity(String sender, String content, String iv) {
        this.sender = sender;
        this.content = content;
        this.iv = iv;
    }

    public Long getId() { return id; }
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public String getIv() { return iv; }

    public void setId(Long id) { this.id = id; }
    public void setSender(String sender) { this.sender = sender; }
    public void setContent(String content) { this.content = content; }
    public void setIv(String iv) { this.iv = iv; }
}
