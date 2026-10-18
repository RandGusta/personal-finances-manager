package com.gustavo.finance.finance_control.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSummaryResponse {
    private String userName;
    private BigDecimal balance;
    private BigDecimal revenue;
    private BigDecimal expenses;
    private List<CategorySummaryResponse> categories;
    private List<MonthlySummaryResponse> months;
}
