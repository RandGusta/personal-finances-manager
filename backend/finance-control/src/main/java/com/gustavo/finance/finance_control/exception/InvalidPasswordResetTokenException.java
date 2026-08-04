package com.gustavo.finance.finance_control.exception;

public class InvalidPasswordResetTokenException extends RuntimeException {

    public InvalidPasswordResetTokenException() {
        super("Password reset token is invalid, expired, or already used");
    }
}
