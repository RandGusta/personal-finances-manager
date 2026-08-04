package com.gustavo.finance.finance_control.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.gustavo.finance.finance_control.entity.User;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(
            jwtService,
            "jwtSecret",
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
        );
    }

    @Test
    void shouldValidateTokenUsingEmailInsteadOfDisplayName() {
        User user = user("Gustavo", "gustavo@example.com");
        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void shouldRejectTokenIssuedForAnotherUser() {
        User tokenOwner = user("Gustavo", "gustavo@example.com");
        User anotherUser = user("Maria", "maria@example.com");
        String token = jwtService.generateToken(tokenOwner);

        assertFalse(jwtService.isTokenValid(token, anotherUser));
    }

    private User user(String name, String email) {
        User user = new User();
        user.setUsername(name);
        user.setEmail(email);
        return user;
    }
}
