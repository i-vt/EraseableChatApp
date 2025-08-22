package com.example.chatapp.repository;

import com.example.chatapp.entity.RegistrationCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationCodeRepository extends JpaRepository<RegistrationCode, String> {
}
