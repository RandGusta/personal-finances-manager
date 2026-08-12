package com.gustavo.finance.finance_control.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.gustavo.finance.finance_control.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        MethodArgumentNotValidException ex
    ) {
        String message = "Request validation failed";
        FieldError fieldError = ex.getBindingResult().getFieldError();

        if (fieldError != null && fieldError.getDefaultMessage() != null) {
            message = fieldError.getDefaultMessage();
        }

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(message));
    }
    
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

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<?> handleConflictException(ConflictException ex) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage()));
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

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<?> handleBusinessException(BusinessException ex) {
        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_CONTENT)
            .body(new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    public ResponseEntity<?> handleInvalidPasswordResetTokenException(
        InvalidPasswordResetTokenException ex
    ) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage()));
    }

    public ResponseEntity<?> handleInvalidTransactionTypeException(InvalidTransactionTypeException ex){
        return ResponseEntity
        .status(HttpStatus.NOT_FOUND)
        .body(
            new com.gustavo.finance.finance_control.dto.ErrorResponse(ex.getMessage())
        );

    }

}
