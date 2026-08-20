package com.gustavo.finance.finance_control.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.MessageResponse;
import com.gustavo.finance.finance_control.dto.WalletInvitationRequest;
import com.gustavo.finance.finance_control.dto.WalletMemberResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.WalletInvitationService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {"http://localhost:5173"})
@RequestMapping("/api/v1")
public class WalletInvitationController {

    private final WalletInvitationService invitationService;

    public WalletInvitationController(WalletInvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/wallets/{walletId}/invitations")
    public ResponseEntity<MessageResponse> invite(
        Authentication authentication,
        @PathVariable Long walletId,
        @Valid @RequestBody WalletInvitationRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(invitationService.invite(
                authenticatedUser(authentication),
                walletId,
                request
            ));
    }

    @PostMapping("/wallet-invitations/{token}/accept")
    public ResponseEntity<WalletMemberResponse> accept(
        Authentication authentication,
        @PathVariable String token
    ) {
        return ResponseEntity.ok(
            invitationService.accept(authenticatedUser(authentication), token)
        );
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
