package com.gustavo.finance.finance_control.security;

public class UserSessionsRevokedEvent {

    private final Long userId;

    public UserSessionsRevokedEvent(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}
