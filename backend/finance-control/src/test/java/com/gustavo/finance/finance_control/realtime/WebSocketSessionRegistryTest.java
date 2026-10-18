package com.gustavo.finance.finance_control.realtime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.security.UserSessionsRevokedEvent;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;

class WebSocketSessionRegistryTest {
    private UserRepository users;
    private WebSocketSessionRegistry registry;
    private User user;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        registry = new WebSocketSessionRegistry(users);
        user = new User();
        user.setId(1L);
    }

    @Test
    void shouldValidateCurrentVersionAndRejectRevokedVersion() {
        registry.authenticate("session", user, Instant.now().plusSeconds(60));
        when(users.findById(1L)).thenReturn(Optional.of(user));
        assertTrue(registry.isValid("session"));

        user.setTokenVersion(1);
        assertFalse(registry.isValid("session"));
    }

    @Test
    void shouldBlockDeliveryAfterTokenExpires() {
        registry.authenticate("session", user, Instant.now().minusSeconds(1));
        assertFalse(registry.isValid("session"));
        verifyNoInteractions(users);
    }

    @Test
    void shouldCloseExistingConnectionWhenSessionsAreRevoked() throws Exception {
        WebSocketSession connection = mock(WebSocketSession.class);
        when(connection.getId()).thenReturn("session");
        when(connection.isOpen()).thenReturn(true);
        WebSocketHandler handler = registry.decorate(mock(WebSocketHandler.class));
        handler.afterConnectionEstablished(connection);
        registry.authenticate("session", user, Instant.now().plusSeconds(60));

        registry.revokeUserSessions(new UserSessionsRevokedEvent(1L));

        verify(connection).close(CloseStatus.POLICY_VIOLATION);
        assertFalse(registry.isValid("session"));
    }
}
