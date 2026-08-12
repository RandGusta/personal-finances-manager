package com.gustavo.finance.finance_control.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.WalletMemberRequest;
import com.gustavo.finance.finance_control.dto.WalletMemberResponse;
import com.gustavo.finance.finance_control.dto.WalletMemberRoleRequest;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.WalletMemberService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequestMapping("/api/v1/wallets/{walletId}/members")
public class WalletMemberController {

    private final WalletMemberService walletMemberService;

    public WalletMemberController(WalletMemberService walletMemberService) {
        this.walletMemberService = walletMemberService;
    }

    @GetMapping
    public ResponseEntity<List<WalletMemberResponse>> list(
        Authentication authentication,
        @PathVariable Long walletId
    ) {
        return ResponseEntity.ok(
            walletMemberService.list(authenticatedUser(authentication), walletId)
        );
    }

    @PostMapping
    public ResponseEntity<WalletMemberResponse> add(
        Authentication authentication,
        @PathVariable Long walletId,
        @Valid @RequestBody WalletMemberRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(walletMemberService.add(authenticatedUser(authentication), walletId, request));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<WalletMemberResponse> updateRole(
        Authentication authentication,
        @PathVariable Long walletId,
        @PathVariable Long userId,
        @Valid @RequestBody WalletMemberRoleRequest request
    ) {
        return ResponseEntity.ok(
            walletMemberService.updateRole(
                authenticatedUser(authentication),
                walletId,
                userId,
                request
            )
        );
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> remove(
        Authentication authentication,
        @PathVariable Long walletId,
        @PathVariable Long userId
    ) {
        walletMemberService.remove(authenticatedUser(authentication), walletId, userId);
        return ResponseEntity.noContent().build();
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
