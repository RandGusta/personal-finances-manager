package com.gustavo.finance.finance_control.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.LoginRequest;
import com.gustavo.finance.finance_control.dto.LoginResponse;
import com.gustavo.finance.finance_control.dto.SingUpRequest;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.security.JwtService;
import com.gustavo.finance.finance_control.service.UserService;

import jakarta.validation.Valid;

@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
        AuthenticationManager authenticationManager,
        UserService userService,
        JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(new LoginResponse(jwtService.generateToken(user)));
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signUp(@Valid @RequestBody SingUpRequest request) {
        userService.insertUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
