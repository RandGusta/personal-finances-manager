package com.gustavo.finance.finance_control.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gustavo.finance.finance_control.dto.TransactionResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;

@Service
public class TransactionReportService {

    private final TransactionService transactionService;

    public TransactionReportService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    public byte[] generateCsv(
        User user,
        Long walletId,
        TransactionType type,
        Long categoryId,
        LocalDate startDate,
        LocalDate endDate
    ) {
        List<TransactionResponse> transactions = transactionService.listForReport(
            user,
            walletId,
            type,
            categoryId,
            startDate,
            endDate
        );

        StringBuilder csv = new StringBuilder();
        csv.append("Date,Description,Category,Type,Amount\n");

        for (TransactionResponse transaction : transactions) {
            csv.append(formatValue(transaction.getDate().toString())).append(',');
            csv.append(formatValue(transaction.getDescription())).append(',');
            csv.append(formatValue(transaction.getCategoryName())).append(',');
            csv.append(formatValue(transaction.getType().name())).append(',');
            csv.append(formatValue(transaction.getAmount().toPlainString())).append('\n');
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String formatValue(String value) {
        String safeValue = value == null ? "" : value;

        if (!safeValue.isEmpty() && "=+-@".indexOf(safeValue.charAt(0)) >= 0) {
            safeValue = "'" + safeValue;
        }

        return "\"" + safeValue.replace("\"", "\"\"") + "\"";
    }
}
