package com.gustavo.finance.finance_control.controller;
import org.springframework.security.core.Authentication;

import java.util.Currency;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.CurrentUserResponse;
import com.gustavo.finance.finance_control.dto.LoginRequest;
import com.gustavo.finance.finance_control.dto.LoginResponse;
import com.gustavo.finance.finance_control.dto.SingUpRequest;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.security.JwtService;
import com.gustavo.finance.finance_control.service.UserService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin
public class UserController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserService userService;

    @Autowired
    JwtService jwtService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest){

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> singUp(@Valid @RequestBody SingUpRequest singUpRequest){
        userService.insertUser(singUpRequest);
        // retornar status 201 -> created
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/home")
    public ResponseEntity<CurrentUserResponse> getCurrentUser(Authentication authentication){
        System.out.println("authentication: " + authentication);
        return ResponseEntity.ok(userService.getCurrentUser(authentication));
    }


}
