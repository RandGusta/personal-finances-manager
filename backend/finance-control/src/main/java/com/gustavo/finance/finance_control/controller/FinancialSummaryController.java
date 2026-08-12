package com.gustavo.finance.finance_control.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.FinancialSummaryResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.FinancialSummaryService;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequestMapping("/api/v1/wallets/{walletId}/summary")
public class FinancialSummaryController {

    private final FinancialSummaryService financialSummaryService;

    public FinancialSummaryController(FinancialSummaryService financialSummaryService) {
        this.financialSummaryService = financialSummaryService;
    }

    @GetMapping
    public ResponseEntity<FinancialSummaryResponse> get(
        Authentication authentication,
        @PathVariable Long walletId,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(financialSummaryService.get(
            authenticatedUser(authentication),
            walletId,
            startDate,
            endDate
        ));
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
