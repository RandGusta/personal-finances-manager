package com.gustavo.finance.finance_control.dto;

import com.gustavo.finance.finance_control.enums.UserRelationWallet;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WalletMemberRoleRequest {

    @NotNull(message = "Role is required")
    private UserRelationWallet role;
}
