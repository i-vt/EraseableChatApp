package com.example.chatapp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class RegistrationCode {
    @Id
    private String code;
    private boolean used;

    public RegistrationCode() {}

    public RegistrationCode(String code) {
        this.code = code;
        this.used = false;
    }

    public String getCode() { return code; }
    public boolean isUsed() { return used; }

    public void setCode(String code) { this.code = code; }
    public void setUsed(boolean used) { this.used = used; }
}
