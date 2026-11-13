package com.gustavo.finance.finance_control.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class AuthenticationRateLimitFilterTest {

    @Test
    void shouldRejectTheThirdLoginRequestInsideTheSameWindow() throws Exception {
        AuthenticationRateLimitFilter filter = new AuthenticationRateLimitFilter(2, 60);
        AtomicInteger filterChainCalls = new AtomicInteger();

        MockHttpServletRequest firstRequest = loginRequest();
        filter.doFilter(firstRequest, new MockHttpServletResponse(), (request, response) ->
            filterChainCalls.incrementAndGet()
        );

        MockHttpServletRequest secondRequest = loginRequest();
        filter.doFilter(secondRequest, new MockHttpServletResponse(), (request, response) ->
            filterChainCalls.incrementAndGet()
        );

        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilter(loginRequest(), blockedResponse, (request, response) ->
            filterChainCalls.incrementAndGet()
        );

        assertEquals(2, filterChainCalls.get());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), blockedResponse.getStatus());
        assertEquals(
            "{\"message\":\"Too many requests. Please try again later.\"}",
            blockedResponse.getContentAsString()
        );
    }

    @Test
    void shouldNotLimitOtherEndpoints() throws Exception {
        AuthenticationRateLimitFilter filter = new AuthenticationRateLimitFilter(1, 60);
        AtomicInteger filterChainCalls = new AtomicInteger();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/wallets");

        filter.doFilter(request, new MockHttpServletResponse(), (servletRequest, response) ->
            filterChainCalls.incrementAndGet()
        );

        assertEquals(1, filterChainCalls.get());
    }

    @Test
    void shouldLimitInsightRequestsInASeparateWindowAndIncludeHead() throws Exception {
        AuthenticationRateLimitFilter filter = new AuthenticationRateLimitFilter(1, 60);
        AtomicInteger filterChainCalls = new AtomicInteger();
        String path = "/api/v1/financial-insights/monthly";

        MockHttpServletRequest firstInsight = new MockHttpServletRequest("GET", path);
        firstInsight.setRemoteAddr("127.0.0.1");
        filter.doFilter(firstInsight, new MockHttpServletResponse(), (request, response) ->
            filterChainCalls.incrementAndGet()
        );

        MockHttpServletRequest secondInsight = new MockHttpServletRequest("HEAD", path);
        secondInsight.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse blocked = new MockHttpServletResponse();
        filter.doFilter(secondInsight, blocked, (request, response) ->
            filterChainCalls.incrementAndGet()
        );

        filter.doFilter(loginRequest(), new MockHttpServletResponse(), (request, response) ->
            filterChainCalls.incrementAndGet()
        );

        assertEquals(2, filterChainCalls.get());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), blocked.getStatus());
    }

    private MockHttpServletRequest loginRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/auth/login");
        request.setRemoteAddr("127.0.0.1");
        return request;
    }
}
