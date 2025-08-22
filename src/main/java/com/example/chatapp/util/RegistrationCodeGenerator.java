package com.example.chatapp.util;

import com.example.chatapp.entity.RegistrationCode;
import com.example.chatapp.repository.RegistrationCodeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Component
public class RegistrationCodeGenerator {

    private final RegistrationCodeRepository repository;

    public RegistrationCodeGenerator(RegistrationCodeRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void generateCodesOnStartup() throws IOException {
        List<RegistrationCode> codes = IntStream.range(0, 4)
            .mapToObj(i -> new RegistrationCode(generateCode()))
            .collect(Collectors.toList());

        repository.saveAll(codes);

        try (FileWriter writer = new FileWriter("codes.txt")) {
            for (RegistrationCode code : codes) {
                writer.write(code.getCode() + "\n");
            }
        }
    }

    private String generateCode() {
        byte[] bytes = new byte[8];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
