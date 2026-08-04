package com.gustavo.finance.finance_control.dto;

import java.time.LocalDateTime;

import com.gustavo.finance.finance_control.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedDate(),
            user.getUpdatedDate()
        );
    }
}
