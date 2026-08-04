package com.gustavo.finance.finance_control.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FinancialSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private long transactionCount;
    private List<CategorySummaryResponse> byCategory;
    private List<MonthlySummaryResponse> byMonth;
}
