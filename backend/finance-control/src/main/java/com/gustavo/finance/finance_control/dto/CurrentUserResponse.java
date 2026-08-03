package com.gustavo.finance.finance_control.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CurrentUserResponse {
    private String userName;
    private String email;
    private BigDecimal balance;
    private BigDecimal revenue;
    private BigDecimal expenses;
}
