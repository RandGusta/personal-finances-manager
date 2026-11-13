package com.gustavo.finance.finance_control.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.gustavo.finance.finance_control.service.UserService;

import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;

class JwtAuthenticationFilterTest {

    @Test
    void shouldReturnUnauthorizedWithoutStackTraceForMalformedToken() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        UserService userService = mock(UserService.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(
            jwtService,
            userService
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);
        request.addHeader("Authorization", "Bearer invalid-token");

        when(jwtService.extractEmail("invalid-token"))
            .thenThrow(new MalformedJwtException("Invalid compact JWT string"));

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertEquals("application/json", response.getContentType());
        assertEquals(
            "{\"message\":\"Invalid or expired authentication token\"}",
            response.getContentAsString()
        );
        assertFalse(response.getContentAsString().contains("trace"));
        verify(jwtService).extractEmail("invalid-token");
        verifyNoInteractions(userService, filterChain);
    }
}
