package com.gustavo.finance.finance_control.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FinancialInsightResponse {

    private String insight;
    private LocalDate periodStart;
    private LocalDate periodEnd;
}
