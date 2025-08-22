package com.example.chatapp.service;

import com.example.chatapp.entity.RegistrationCode;
import com.example.chatapp.model.UserRestrictions;
import com.example.chatapp.model.UserSessionInfo;
import com.example.chatapp.repository.RegistrationCodeRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class UserService {

    private final Map<String, String> users = new ConcurrentHashMap<>(); // username -> TOTP secret
    private final Map<String, Boolean> keyIssued = new ConcurrentHashMap<>();
    private final Map<String, UserSessionInfo> activeUsers = new ConcurrentHashMap<>();
    private final Map<String, UserRestrictions> restrictions = new ConcurrentHashMap<>();
    private final List<String> activityLog = new CopyOnWriteArrayList<>();

    private final RegistrationCodeRepository registrationCodeRepository;
    private final TOTPService totpService;
    private final SharedSecretService sharedSecretService;
    public UserRestrictions getUserRestrictions(String username) {
        return restrictions.get(username);
    }

    public UserService(RegistrationCodeRepository registrationCodeRepository,
                       TOTPService totpService,
                       SharedSecretService sharedSecretService) {
        this.registrationCodeRepository = registrationCodeRepository;
        this.totpService = totpService;
        this.sharedSecretService = sharedSecretService;
    }

    public void dropAllUsers() {
        users.clear();
        keyIssued.clear();
        activeUsers.clear();
        activityLog.clear();
        restrictions.clear();
    }

    public boolean authenticate(String username, String input) {
        String totpSecret = users.get(username);
        if (totpSecret == null) return false;

        List<String> validCodes = totpService.generateTOTPCodes(totpSecret);
        return validCodes.contains(input);
    }

    public boolean hasReceivedKey(String username) {
        return keyIssued.getOrDefault(username, false);
    }

    public void markKeyIssued(String username) {
        keyIssued.put(username, true);
    }

    public Optional<String> registerWithCode(String code, String password) {
        Optional<RegistrationCode> opt = registrationCodeRepository.findById(code);
        if (opt.isPresent() && !opt.get().isUsed()) {
            String username = generateFriendlyUsername();

            users.put(username, password); // password is used as TOTP secret
            keyIssued.put(username, false);
            restrictions.put(username, new UserRestrictions());

            RegistrationCode usedCode = opt.get();
            usedCode.setUsed(true);
            registrationCodeRepository.save(usedCode);

            if (countUnusedRegistrationCodes() == 0) {
                sharedSecretService.clearSharedKey();
            }

            return Optional.of(username);
        }
        return Optional.empty();
    }

    private String generateFriendlyUsername() {
        String[] adjectives = {"Big", "Cool", "Fast", "Smart", "Brave", "Happy", "Red", "Blue", "Sneaky", "Wise"};
        String[] nouns = {"Elephant", "Tiger", "Eagle", "Lion", "Fox", "Wolf", "Bear", "Hawk", "Dragon", "Shark"};

        Random random = new Random();
        String adjective = adjectives[random.nextInt(adjectives.length)];
        String noun = nouns[random.nextInt(nouns.length)];
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        return adjective + noun + "_" + suffix;
    }

    public long countUnusedRegistrationCodes() {
        return registrationCodeRepository.findAll()
                .stream()
                .filter(code -> !code.isUsed())
                .count();
    }

    public void loginUser(String username) {
        activeUsers.put(username, new UserSessionInfo(username, Instant.now(), "online"));
        activityLog.add(username + " logged in at " + Instant.now());
    }

    public void logoutUser(String username) {
        UserSessionInfo info = activeUsers.get(username);
        if (info != null) {
            info.setStatus("offline");
            activityLog.add(username + " logged out at " + Instant.now());
        }
    }

    public List<String> getActivityLog() {
        return activityLog;
    }

    public Collection<UserSessionInfo> getAllUserSessions() {
        List<UserSessionInfo> sessions = new ArrayList<>();
        for (String username : users.keySet()) {
            UserSessionInfo sessionInfo = activeUsers.get(username);
            if (sessionInfo != null) {
                sessions.add(sessionInfo);
            } else {
                sessions.add(new UserSessionInfo(username, null, "never logged in"));
            }
        }
        return sessions;
    }

    public boolean changeUsername(String oldUsername, String newUsername) {
        if (newUsername == null || !newUsername.matches("^[A-Za-z0-9_.()\\[\\]{}<>]{1,16}$")) {
            activityLog.add(oldUsername + " failed to change username (invalid characters) " + Instant.now());
            return false;
        }

        if (users.containsKey(newUsername)) {
            activityLog.add(oldUsername + " failed to change username (duplicate) " + Instant.now());
            return false;
        }

        Instant now = Instant.now();
        UserRestrictions restriction = restrictions.getOrDefault(oldUsername, new UserRestrictions());
        Instant lastChange = restriction.getLastUsernameChange();

        if (lastChange != null && now.isBefore(lastChange.plus(Duration.ofMinutes(10)))) {
            activityLog.add(oldUsername + " failed to change username (rate limited) " + now);
            return false;
        }

        String secret = users.remove(oldUsername);
        Boolean keyFlag = keyIssued.remove(oldUsername);
        UserSessionInfo sessionInfo = activeUsers.remove(oldUsername);
        UserRestrictions oldRestriction = restrictions.remove(oldUsername);

        if (secret == null) {
            return false; // old username doesn't exist
        }

        users.put(newUsername, secret);
        keyIssued.put(newUsername, keyFlag != null ? keyFlag : false);

        if (sessionInfo != null) {
            sessionInfo = new UserSessionInfo(newUsername, sessionInfo.getLastOnlineUtc(), sessionInfo.getStatus());
            activeUsers.put(newUsername, sessionInfo);
        }

        UserRestrictions newRestriction = oldRestriction != null ? oldRestriction : new UserRestrictions();
        newRestriction.setLastUsernameChange(now);
        restrictions.put(newUsername, newRestriction);

        activityLog.add(oldUsername + " changed username to " + newUsername + " at " + now);
        return true;
    }
}
