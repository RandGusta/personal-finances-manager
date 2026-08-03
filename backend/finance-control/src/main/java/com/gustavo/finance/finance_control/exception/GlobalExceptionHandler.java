package com.gustavo.finance.finance_control.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ExistingEmailException.class)
    public ResponseEntity<?> handleExistingEmailException(ExistingEmailException ex){
        return ResponseEntity
        .status(HttpStatus.CONFLICT)
        .body(
            new com.gustavo.finance.finance_control.dto.ErrorResponse(
                ex.getMessage()
            )
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleWrongCredentialsException(BadCredentialsException ex){
        return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(
        new com.gustavo.finance.finance_control.dto.ErrorResponse(
            "Email or password is incorrect!"
        )
    );
    }

    public ResponseEntity<?> handleInvalidTransactionTypeException(InvalidTransactionTypeException ex){
        return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(
            new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage())
        );

    }

}
