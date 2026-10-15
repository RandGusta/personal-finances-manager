package com.gustavo.finance.finance_control.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gustavo.finance.finance_control.dto.FinancialInsightResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.service.FinancialInsightService;

@RestController
@CrossOrigin(origins = "${app.frontend-url}")
@RequestMapping("/api/v1/financial-insights")
public class FinancialInsightController {

    private final FinancialInsightService financialInsightService;

    public FinancialInsightController(FinancialInsightService financialInsightService) {
        this.financialInsightService = financialInsightService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<FinancialInsightResponse> generateMonthlyInsight(
        Authentication authentication
    ) {
        return ResponseEntity.ok(
            financialInsightService.generateMonthlyInsight(authenticatedUser(authentication))
        );
    }

    private User authenticatedUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
