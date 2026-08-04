package com.gustavo.finance.finance_control.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.LoginRequest;
import com.gustavo.finance.finance_control.dto.LoginResponse;
import com.gustavo.finance.finance_control.dto.ForgotPasswordRequest;
import com.gustavo.finance.finance_control.dto.ForgotPasswordResponse;
import com.gustavo.finance.finance_control.dto.MessageResponse;
import com.gustavo.finance.finance_control.dto.RegisterRequest;
import com.gustavo.finance.finance_control.dto.RegisterResponse;
import com.gustavo.finance.finance_control.dto.ResetPasswordRequest;
import com.gustavo.finance.finance_control.service.AuthenticationService;
import com.gustavo.finance.finance_control.service.PasswordRecoveryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final PasswordRecoveryService passwordRecoveryService;

    public AuthController(
        AuthenticationService authenticationService,
        PasswordRecoveryService passwordRecoveryService
    ) {
        this.authenticationService = authenticationService;
        this.passwordRecoveryService = passwordRecoveryService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authenticationService.register(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(passwordRecoveryService.forgotPassword(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request
    ) {
        passwordRecoveryService.resetPassword(request);
        return ResponseEntity.ok(new MessageResponse("Senha redefinida com sucesso."));
    }
}
