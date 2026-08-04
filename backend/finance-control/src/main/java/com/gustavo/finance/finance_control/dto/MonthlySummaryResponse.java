package com.gustavo.finance.finance_control.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlySummaryResponse {

    private String month;
    private BigDecimal income;
    private BigDecimal expense;
}
