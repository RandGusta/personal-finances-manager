package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gustavo.finance.finance_control.dto.CategorySummaryResponse;
import com.gustavo.finance.finance_control.dto.FinancialInsightResponse;
import com.gustavo.finance.finance_control.dto.FinancialSummaryResponse;
import com.gustavo.finance.finance_control.dto.WalletResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;

@ExtendWith(MockitoExtension.class)
class FinancialInsightServiceTest {

    @Mock
    private WalletService walletService;

    @Mock
    private FinancialSummaryService financialSummaryService;

    @Mock
    private GeminiInsightClient geminiInsightClient;

    private FinancialInsightService financialInsightService;
    private User user;

    @BeforeEach
    void setUp() {
        financialInsightService = new FinancialInsightService(
            walletService,
            financialSummaryService,
            geminiInsightClient
        );

        user = new User();
        user.setId(1L);
    }

    @Test
    void shouldGenerateInsightFromMonthlyWalletTotals() {
        WalletResponse wallet = new WalletResponse(
            10L,
            "Personal wallet",
            null,
            null,
            UserRelationWallet.OWNER,
            1
        );
        FinancialSummaryResponse summary = new FinancialSummaryResponse(
            new BigDecimal("5000"),
            new BigDecimal("3200"),
            new BigDecimal("1800"),
            6,
            List.of(new CategorySummaryResponse(2L, "Food", new BigDecimal("900"))),
            List.of()
        );

        when(walletService.list(user)).thenReturn(List.of(wallet));
        when(financialSummaryService.get(
            eq(user),
            eq(10L),
            eq(LocalDate.now().withDayOfMonth(1)),
            eq(LocalDate.now())
        )).thenReturn(summary);
        when(geminiInsightClient.generateInsight(contains("Food: 900 BRL")))
            .thenReturn("- Food was your largest category.");

        FinancialInsightResponse response = financialInsightService.generateMonthlyInsight(user);

        assertEquals("- Food was your largest category.", response.getInsight());
        verify(geminiInsightClient).generateInsight(contains("Income: 5000 BRL"));
        verify(geminiInsightClient).generateInsight(contains("Expenses: 3200 BRL"));
    }
}
