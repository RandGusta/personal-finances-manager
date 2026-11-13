package com.gustavo.finance.finance_control.realtime;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.security.UserSessionsRevokedEvent;

@Service
public class WalletEventService {

    private final Map<String, Connection> connections = new ConcurrentHashMap<>();
    private final UserRepository userRepository;

    public WalletEventService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public SseEmitter subscribe(User user, Instant expiresAt) {
        String connectionId = UUID.randomUUID().toString(); 
        
        SseEmitter emitter = new SseEmitter(0L);
        Connection connection = new Connection(user, expiresAt, emitter);
        connections.put(connectionId, connection);

        emitter.onCompletion(() -> connections.remove(connectionId));
        emitter.onTimeout(() -> close(connectionId, connection));
        emitter.onError(error -> connections.remove(connectionId));

        send(connectionId, connection, "connected", "ready");
        return emitter;
    }

    public void sendToUser(Long userId, WalletUpdateResponse response) {
        for (Map.Entry<String, Connection> entry : connections.entrySet()) {
            if (userId.equals(entry.getValue().userId)) {
                send(entry.getKey(), entry.getValue(), "wallet-update", response);
            }
        }
    }

    @TransactionalEventListener
    public void revokeUserSessions(UserSessionsRevokedEvent event) {
        for (Map.Entry<String, Connection> entry : connections.entrySet()) {
            if (event.getUserId().equals(entry.getValue().userId)) {
                close(entry.getKey(), entry.getValue());
            }
        }
    }

    @Scheduled(fixedDelay = 15000)
    public void sendHeartbeats() {
        // Mantém a conexão ativa e detecta clientes desconectados ou tokens revogados.
        for (Map.Entry<String, Connection> entry : connections.entrySet()) {
            send(entry.getKey(), entry.getValue(), "heartbeat", "keep-alive");
        }
    }

    private boolean isValid(Connection connection) {
        if (!connection.expiresAt.isAfter(Instant.now())) {
            return false;
        }
        User user = userRepository.findById(connection.userId).orElse(null);
        return user != null && user.getTokenVersion() == connection.tokenVersion;
    }

    private void send(String id, Connection connection, String event, Object data) {
        synchronized (connection) {
            if (!connections.containsKey(id)) {
                return;
            }
            if (!isValid(connection)) {
                close(id, connection);
                return;
            }
            try {
                connection.emitter.send(SseEmitter.event().name(event).data(data));
            } catch (IOException | IllegalStateException exception) {
                // Uma falha neste cliente não impede os outros membros de receber o aviso.
                close(id, connection);
            }
        }
    }

    private void close(String id, Connection connection) {
        synchronized (connection) {
            if (connections.remove(id) != null) {
                connection.emitter.complete();
            }
        }
    }

    private static class Connection {
        private final Long userId;
        private final long tokenVersion;
        private final Instant expiresAt;
        private final SseEmitter emitter;

        Connection(User user, Instant expiresAt, SseEmitter emitter) {
            this.userId = user.getId();
            this.tokenVersion = user.getTokenVersion();
            this.expiresAt = expiresAt;
            this.emitter = emitter;
        }
    }
}
