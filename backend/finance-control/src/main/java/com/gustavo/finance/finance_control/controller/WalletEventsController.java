package com.gustavo.finance.finance_control.controller;

import java.time.Instant;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.realtime.WalletEventService;
import com.gustavo.finance.finance_control.security.JwtService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@CrossOrigin(origins = "${app.frontend-url}")
@RequestMapping("/api/v1/users/me/events")
public class WalletEventsController {

    private final WalletEventService walletEventService;
    private final JwtService jwtService;

    public WalletEventsController(WalletEventService walletEventService, JwtService jwtService) {
        this.walletEventService = walletEventService;
        this.jwtService = jwtService;
    }

    @Operation(summary = "Receive transaction change notifications for your wallets using SSE")
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> subscribe(
        Authentication authentication,
        @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization
    ) {
        
        User user = (User) authentication.getPrincipal();
        String token = authorization.substring(7);
        Instant expiresAt = jwtService.extractExpiration(token).toInstant();

        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .header("X-Accel-Buffering", "no")
            .body(walletEventService.subscribe(user, expiresAt));
    }
}
