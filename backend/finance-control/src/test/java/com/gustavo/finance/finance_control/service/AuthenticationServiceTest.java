package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.gustavo.finance.finance_control.dto.LoginRequest;
import com.gustavo.finance.finance_control.dto.LoginResponse;
import com.gustavo.finance.finance_control.dto.RegisterRequest;
import com.gustavo.finance.finance_control.dto.RegisterResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
            authenticationManager,
            userService,
            jwtService
        );
    }

    @Test
    void shouldReturnRegisteredUserData() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Gustavo");
        request.setEmail("gustavo@example.com");
        request.setPassword("password123");

        User savedUser = user();
        when(userService.register(request)).thenReturn(savedUser);

        RegisterResponse response = authenticationService.register(request);

        assertEquals(1L, response.getId());
        assertEquals("Gustavo", response.getName());
        assertEquals("gustavo@example.com", response.getEmail());
    }

    @Test
    void shouldAuthenticateAndReturnBearerTokenMetadata() {
        LoginRequest request = new LoginRequest();
        request.setEmail("gustavo@example.com");
        request.setPassword("password123");

        User user = user();
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(new UsernamePasswordAuthenticationToken(user, null));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(86_400L);

        LoginResponse response = authenticationService.login(request);

        assertEquals("jwt-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(86_400L, response.getExpiresIn());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    private User user() {
        User user = new User();
        user.setId(1L);
        user.setUsername("Gustavo");
        user.setEmail("gustavo@example.com");
        user.setCreatedDate(LocalDateTime.now());
        return user;
    }
}
