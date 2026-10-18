package com.gustavo.finance.finance_control.realtime;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.handler.WebSocketHandlerDecoratorFactory;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.security.UserSessionsRevokedEvent;

@Component
public class WebSocketSessionRegistry implements WebSocketHandlerDecoratorFactory {

    private final Map<String, WebSocketSession> connections = new ConcurrentHashMap<>();
    private final Map<String, SessionAuthentication> authentications = new ConcurrentHashMap<>();
    private final UserRepository userRepository;

    public WebSocketSessionRegistry(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public WebSocketHandler decorate(WebSocketHandler handler) {
        return new WebSocketHandlerDecorator(handler) {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                connections.put(session.getId(), session);
                super.afterConnectionEstablished(session);
            }

            @Override
            public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
                connections.remove(session.getId());
                authentications.remove(session.getId());
                super.afterConnectionClosed(session, status);
            }
        };
    }

    public void authenticate(String sessionId, User user, Instant expiresAt) {
        authentications.put(sessionId, new SessionAuthentication(
            user.getId(), user.getTokenVersion(), expiresAt
        ));
    }

    public boolean isValid(String sessionId) {
        if (sessionId == null) {
            return false;
        }
        SessionAuthentication authentication = authentications.get(sessionId);
        if (authentication == null || !authentication.expiresAt.isAfter(Instant.now())) {
            closeSession(sessionId);
            return false;
        }

        User user = userRepository.findById(authentication.userId).orElse(null);
        if (user == null || user.getTokenVersion() != authentication.tokenVersion) {
            closeSession(sessionId);
            return false;
        }
        return true;
    }

    @TransactionalEventListener
    public void revokeUserSessions(UserSessionsRevokedEvent event) {
        for (Map.Entry<String, SessionAuthentication> entry : authentications.entrySet()) {
            if (event.getUserId().equals(entry.getValue().userId)) {
                closeSession(entry.getKey());
            }
        }
    }

    @Scheduled(fixedDelay = 10000)
    public void closeExpiredSessions() {
        for (Map.Entry<String, SessionAuthentication> entry : authentications.entrySet()) {
            if (!entry.getValue().expiresAt.isAfter(Instant.now())) {
                closeSession(entry.getKey());
            }
        }
    }

    private void closeSession(String sessionId) {
        authentications.remove(sessionId);
        WebSocketSession connection = connections.remove(sessionId);
        if (connection != null && connection.isOpen()) {
            try {
                connection.close(CloseStatus.POLICY_VIOLATION);
            } catch (IOException exception) {
                // Authentication is already removed, so this session cannot receive updates.
            }
        }
    }

    private static class SessionAuthentication {
        private final Long userId;
        private final long tokenVersion;
        private final Instant expiresAt;

        SessionAuthentication(Long userId, long tokenVersion, Instant expiresAt) {
            this.userId = userId;
            this.tokenVersion = tokenVersion;
            this.expiresAt = expiresAt;
        }
    }
}
