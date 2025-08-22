package com.example.chatapp.session;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionRegistry implements HttpSessionListener {

    private static final Set<HttpSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void sessionCreated(HttpSessionEvent event) {
        sessions.add(event.getSession());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        sessions.remove(event.getSession());
    }

    public void invalidateAll() {
        for (HttpSession session : sessions) {
            try {
                session.invalidate();
            } catch (IllegalStateException ignored) {
                // already invalidated
            }
        }
        sessions.clear();
    }
}
