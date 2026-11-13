package com.gustavo.finance.finance_control.security;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthenticationRateLimitFilter extends OncePerRequestFilter {

    private final Map<String, RequestWindow> requestsByClient = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final Duration windowDuration;

    public AuthenticationRateLimitFilter(
        @Value("${security.rate-limit.max-requests:5}") int maxRequests,
        @Value("${security.rate-limit.window-seconds:60}") long windowSeconds
    ) {
        this.maxRequests = maxRequests;
        this.windowDuration = Duration.ofSeconds(windowSeconds);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        if (path.isEmpty()) {
            path = request.getRequestURI();
        }

        String method = request.getMethod();
        if ("POST".equals(method)) {
            return !"/auth/login".equals(path) && !"/auth/forgot-password".equals(path);
        }

        if ("GET".equals(method) || "HEAD".equals(method)) {
            return !"/api/v1/financial-insights/monthly".equals(path);
        }

        return true;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        Instant now = Instant.now();
        removeExpiredWindows(now);

        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        RequestWindow requestWindow = requestsByClient.computeIfAbsent(
            key,
            ignored -> new RequestWindow(now)
        );

        if (!requestWindow.registerRequest(now, maxRequests, windowDuration)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"message\":\"Too many requests. Please try again later.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void removeExpiredWindows(Instant now) {
        requestsByClient.entrySet().removeIf(
            entry -> entry.getValue().isExpired(now, windowDuration)
        );
    }

    private static class RequestWindow {

        private Instant startedAt;
        private int requestCount;

        RequestWindow(Instant startedAt) {
            this.startedAt = startedAt;
        }

        synchronized boolean registerRequest(
            Instant now,
            int maxRequests,
            Duration windowDuration
        ) {
            if (isExpired(now, windowDuration)) {
                startedAt = now;
                requestCount = 0;
            }

            if (requestCount >= maxRequests) {
                return false;
            }

            requestCount++;
            return true;
        }

        synchronized boolean isExpired(Instant now, Duration windowDuration) {
            return !now.isBefore(startedAt.plus(windowDuration));
        }
    }
}
