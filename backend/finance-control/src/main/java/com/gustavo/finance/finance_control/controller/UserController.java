package com.gustavo.finance.finance_control.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.ChangePasswordRequest;
import com.gustavo.finance.finance_control.dto.MessageResponse;
import com.gustavo.finance.finance_control.dto.UpdateUserRequest;
import com.gustavo.finance.finance_control.dto.UserProfileResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.UserService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {"http://localhost:5173"})
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authenticatedUser(authentication)));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
        Authentication authentication,
        @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(
            userService.updateProfile(authenticatedUser(authentication), request)
        );
    }

    @PatchMapping("/me/password")
    public ResponseEntity<MessageResponse> changePassword(
        Authentication authentication,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(authenticatedUser(authentication), request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully."));
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
