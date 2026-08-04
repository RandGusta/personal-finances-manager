package com.gustavo.finance.finance_control.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.WalletRequest;
import com.gustavo.finance.finance_control.dto.WalletResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.WalletService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ResponseEntity<List<WalletResponse>> list(Authentication authentication) {
        return ResponseEntity.ok(walletService.list(authenticatedUser(authentication)));
    }

    @PostMapping
    public ResponseEntity<WalletResponse> create(
        Authentication authentication,
        @Valid @RequestBody WalletRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(walletService.create(authenticatedUser(authentication), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalletResponse> get(
        Authentication authentication,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(walletService.get(authenticatedUser(authentication), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WalletResponse> update(
        Authentication authentication,
        @PathVariable Long id,
        @Valid @RequestBody WalletRequest request
    ) {
        return ResponseEntity.ok(
            walletService.update(authenticatedUser(authentication), id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        walletService.delete(authenticatedUser(authentication), id);
        return ResponseEntity.noContent().build();
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
