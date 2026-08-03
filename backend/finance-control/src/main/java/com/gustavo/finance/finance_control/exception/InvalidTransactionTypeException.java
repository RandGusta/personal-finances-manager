package com.gustavo.finance.finance_control.exception;

public class InvalidTransactionTypeException extends RuntimeException{

    public InvalidTransactionTypeException(){
        super("Invalid transaction type");
    }

    public InvalidTransactionTypeException(String message){
        super(message);
    }
    
}
