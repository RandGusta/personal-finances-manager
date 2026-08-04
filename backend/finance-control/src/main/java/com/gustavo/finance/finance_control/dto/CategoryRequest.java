package com.gustavo.finance.finance_control.dto;

import com.gustavo.finance.finance_control.enums.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 80, message = "Name must have at most 80 characters")
    private String name;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @Pattern(
        regexp = "^$|^#[0-9A-Fa-f]{6}$",
        message = "Color must be a valid hexadecimal value, such as #FF5733"
    )
    private String color;
}
