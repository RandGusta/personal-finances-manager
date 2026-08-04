package com.gustavo.finance.finance_control.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.gustavo.finance.finance_control.dto.LoginRequest;
import com.gustavo.finance.finance_control.dto.LoginResponse;
import com.gustavo.finance.finance_control.dto.RegisterRequest;
import com.gustavo.finance.finance_control.dto.RegisterResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.security.JwtService;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    public AuthenticationService(
        AuthenticationManager authenticationManager,
        UserService userService,
        JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {
        return RegisterResponse.from(userService.register(request));
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);

        return new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds());
    }
}
