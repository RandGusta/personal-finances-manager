package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gustavo.finance.finance_control.dto.TransactionResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;

@ExtendWith(MockitoExtension.class)
class TransactionReportServiceTest {

    @Mock
    private TransactionService transactionService;

    @Test
    void shouldGenerateCsvAndProtectSpreadsheetFormulaValues() {
        User user = new User();
        TransactionResponse transaction = new TransactionResponse(
            1L,
            2L,
            3L,
            "Food",
            4L,
            "Gustavo",
            TransactionType.EXPENSE,
            new BigDecimal("25.50"),
            "=SUM(A1:A2)",
            LocalDate.of(2026, 10, 15),
            LocalDateTime.now()
        );

        when(transactionService.listForReport(
            eq(user),
            eq(2L),
            any(),
            any(),
            any(),
            any()
        )).thenReturn(List.of(transaction));

        TransactionReportService reportService = new TransactionReportService(transactionService);

        byte[] report = reportService.generateCsv(user, 2L, null, null, null, null);

        String csv = new String(report, StandardCharsets.UTF_8);
        assertEquals(
            "Date,Description,Category,Type,Amount\n"
                + "\"2026-10-15\",\"'=SUM(A1:A2)\",\"Food\",\"EXPENSE\",\"25.50\"\n",
            csv
        );
    }
}
