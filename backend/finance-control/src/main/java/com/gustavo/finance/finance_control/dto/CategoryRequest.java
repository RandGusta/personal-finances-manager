package com.gustavo.finance.finance_control.dto;

import com.gustavo.finance.finance_control.enums.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 80, message = "Name must have at most 80 characters")
    private String name;

    @NotNull(message = "Type is required")
    private TransactionType type;
}
