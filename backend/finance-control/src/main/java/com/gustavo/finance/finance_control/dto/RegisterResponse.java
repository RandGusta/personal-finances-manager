package com.gustavo.finance.finance_control.dto;

import java.time.LocalDateTime;

import com.gustavo.finance.finance_control.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {

    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;

    public static RegisterResponse from(User user) {
        return new RegisterResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedDate()
        );
    }
}
