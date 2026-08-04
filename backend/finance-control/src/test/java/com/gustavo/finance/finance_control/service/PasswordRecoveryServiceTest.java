package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gustavo.finance.finance_control.dto.ForgotPasswordResponse;
import com.gustavo.finance.finance_control.dto.ResetPasswordRequest;
import com.gustavo.finance.finance_control.entity.RedifinationPasswordToken;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.exception.InvalidPasswordResetTokenException;
import com.gustavo.finance.finance_control.repository.RedifinationPasswordTokenRepository;
import com.gustavo.finance.finance_control.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PasswordRecoveryServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedifinationPasswordTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private PasswordRecoveryService passwordRecoveryService;
    private User user;

    @BeforeEach
    void setUp() {
        passwordRecoveryService = new PasswordRecoveryService(
            userRepository,
            tokenRepository,
            passwordEncoder
        );

        user = new User();
        user.setId(1L);
        user.setEmail("gustavo@example.com");
        user.setPassword("old-encoded-password");
    }

    @Test
    void shouldReturnNeutralResponseWhenEmailDoesNotExist() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ForgotPasswordResponse response =
            passwordRecoveryService.forgotPassword("unknown@example.com");

        assertNotNull(response.getMessage());
        assertNull(response.getDebugToken());
        verify(tokenRepository, never()).save(any(RedifinationPasswordToken.class));
    }

    @Test
    void shouldCreateOneHourTokenForExistingUser() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(RedifinationPasswordToken.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        LocalDateTime beforeCreation = LocalDateTime.now();
        ForgotPasswordResponse response = passwordRecoveryService.forgotPassword(user.getEmail());

        ArgumentCaptor<RedifinationPasswordToken> tokenCaptor =
            ArgumentCaptor.forClass(RedifinationPasswordToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());

        RedifinationPasswordToken token = tokenCaptor.getValue();
        assertEquals(user, token.getUser());
        assertFalse(token.isUsed());
        assertTrue(token.getExpireDate().isAfter(beforeCreation.plusMinutes(59)));
        assertEquals(token.getToken(), response.getDebugToken());
    }

    @Test
    void shouldRejectUnknownToken() {
        when(tokenRepository.findByToken("unknown-token")).thenReturn(Optional.empty());

        assertThrows(
            InvalidPasswordResetTokenException.class,
            () -> passwordRecoveryService.resetPassword(request("unknown-token"))
        );
    }

    @Test
    void shouldRejectExpiredToken() {
        RedifinationPasswordToken token = token(false, LocalDateTime.now().minusMinutes(1));
        when(tokenRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));

        assertThrows(
            InvalidPasswordResetTokenException.class,
            () -> passwordRecoveryService.resetPassword(request(token.getToken()))
        );
    }

    @Test
    void shouldRejectAlreadyUsedToken() {
        RedifinationPasswordToken token = token(true, LocalDateTime.now().plusMinutes(30));
        when(tokenRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));

        assertThrows(
            InvalidPasswordResetTokenException.class,
            () -> passwordRecoveryService.resetPassword(request(token.getToken()))
        );
    }

    @Test
    void shouldResetPasswordAndMarkTokenAsUsed() {
        RedifinationPasswordToken token = token(false, LocalDateTime.now().plusMinutes(30));
        ResetPasswordRequest request = request(token.getToken());
        when(tokenRepository.findByToken(token.getToken())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("new-encoded-password");

        passwordRecoveryService.resetPassword(request);

        assertEquals("new-encoded-password", user.getPassword());
        assertTrue(token.isUsed());
        verify(userRepository).save(user);
        verify(tokenRepository).save(token);
    }

    private RedifinationPasswordToken token(boolean used, LocalDateTime expiration) {
        RedifinationPasswordToken token = new RedifinationPasswordToken();
        token.setToken("reset-token");
        token.setUser(user);
        token.setUsed(used);
        token.setExpireDate(expiration);
        return token;
    }

    private ResetPasswordRequest request(String token) {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword("new-password");
        return request;
    }
}
