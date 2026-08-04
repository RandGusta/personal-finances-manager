package com.gustavo.finance.finance_control.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WalletRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must have at most 100 characters")
    private String name;

    @Size(max = 255, message = "Description must have at most 255 characters")
    private String description;
}
