package com.gustavo.finance.finance_control.dto;

import java.time.LocalDateTime;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WalletMemberResponse {

    private Long userId;
    private String name;
    private String email;
    private UserRelationWallet role;
    private LocalDateTime joinedAt;

    public static WalletMemberResponse from(UserWallet membership) {
        User user = membership.getUser();
        return new WalletMemberResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            membership.getUserRelationWallet(),
            membership.getAssociationDate()
        );
    }
}
