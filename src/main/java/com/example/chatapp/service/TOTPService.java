package com.example.chatapp.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class TOTPService {

    private static final int TIME_STEP_MINUTES = 5;
    private static final int SKEW_STEPS = 1;
    private static final int CODE_LENGTH = 12;

    public List<String> generateTOTPCodes(String secret) {
        List<Long> counters = getTimeCounters(TIME_STEP_MINUTES, SKEW_STEPS);
        List<String> validCodes = new ArrayList<>();

        for (long counter : counters) {
            validCodes.add(generateTOTPCode(secret, counter, CODE_LENGTH));
        }

        return validCodes;
    }

    private List<Long> getTimeCounters(int timeStepMinutes, int skewSteps) {
        long currentEpochSeconds = Instant.now().getEpochSecond();
        long timeStepSeconds = timeStepMinutes * 60;
        long currentCounter = currentEpochSeconds / timeStepSeconds;

        List<Long> counters = new ArrayList<>();
        for (int i = -skewSteps; i <= skewSteps; i++) {
            counters.add(currentCounter + i);
        }
        return counters;
    }

    private String generateTOTPCode(String secret, long counter, int length) {
        try {
            byte[] keyBytes = secret.getBytes();
            SecretKeySpec signKey = new SecretKeySpec(keyBytes, "HmacSHA512");

            ByteBuffer buffer = ByteBuffer.allocate(8);
            buffer.putLong(counter);
            byte[] counterBytes = buffer.array();

            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(signKey);
            byte[] hmac = mac.doFinal(counterBytes);

            int offset = hmac[hmac.length - 1] & 0x0F;
            byte[] truncated = new byte[10];
            System.arraycopy(hmac, offset, truncated, 0, 10);

            String base32Encoded = base32Encode(truncated).replace("=", "");
            return base32Encoded.substring(0, Math.min(length, base32Encoded.length()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate TOTP code", e);
        }
    }

    private String base32Encode(byte[] data) {
        final String base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer <<= 8;
            buffer |= (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1F;
                result.append(base32Chars.charAt(index));
                bitsLeft -= 5;
            }
        }

        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            result.append(base32Chars.charAt(index));
        }

        return result.toString();
    }
}