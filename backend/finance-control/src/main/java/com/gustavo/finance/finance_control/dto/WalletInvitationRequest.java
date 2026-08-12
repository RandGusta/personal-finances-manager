package com.gustavo.finance.finance_control.dto;

import com.gustavo.finance.finance_control.enums.UserRelationWallet;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WalletInvitationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotNull(message = "Role is required")
    private UserRelationWallet role;
}
