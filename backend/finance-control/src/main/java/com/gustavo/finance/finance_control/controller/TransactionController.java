package com.gustavo.finance.finance_control.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.TransactionRequest;
import com.gustavo.finance.finance_control.dto.TransactionResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> list(
        Authentication authentication,
        @PathVariable Long walletId,
        @RequestParam(required = false) TransactionType type,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC)
        Pageable pageable
    ) {
        return ResponseEntity.ok(transactionService.list(
            authenticatedUser(authentication),
            walletId,
            type,
            categoryId,
            startDate,
            endDate,
            pageable
        ));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
        Authentication authentication,
        @PathVariable Long walletId,
        @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(transactionService.create(
                authenticatedUser(authentication),
                walletId,
                request
            ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> get(
        Authentication authentication,
        @PathVariable Long walletId,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(
            transactionService.get(authenticatedUser(authentication), walletId, id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(
        Authentication authentication,
        @PathVariable Long walletId,
        @PathVariable Long id,
        @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.ok(transactionService.update(
            authenticatedUser(authentication),
            walletId,
            id,
            request
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        Authentication authentication,
        @PathVariable Long walletId,
        @PathVariable Long id
    ) {
        transactionService.delete(authenticatedUser(authentication), walletId, id);
        return ResponseEntity.noContent().build();
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
