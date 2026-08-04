package com.gustavo.finance.finance_control.dto;

import java.time.LocalDateTime;

import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WalletResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private UserRelationWallet role;
    private long memberCount;

    public static WalletResponse from(UserWallet membership, long memberCount) {
        Wallet wallet = membership.getWallet();
        return new WalletResponse(
            wallet.getId(),
            wallet.getName(),
            wallet.getDescription(),
            wallet.getCreatedDate(),
            membership.getUserRelationWallet(),
            memberCount
        );
    }
}
