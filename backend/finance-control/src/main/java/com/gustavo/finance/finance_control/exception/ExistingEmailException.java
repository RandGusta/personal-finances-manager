package com.gustavo.finance.finance_control.exception;

public class ExistingEmailException extends RuntimeException{
    
    public ExistingEmailException(){
        super("Not possible to register!");
    }

    public ExistingEmailException(String message){
        super(message);
    }
}
