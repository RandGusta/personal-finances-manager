package com.gustavo.finance.finance_control.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategorySummaryResponse {

    private Long categoryId;
    private String categoryName;
    private BigDecimal total;
}
