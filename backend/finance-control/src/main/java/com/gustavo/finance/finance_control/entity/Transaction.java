package com.gustavo.finance.finance_control.entity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gustavo.finance.finance_control.enums.TransactionType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Entity
@Data

public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Wallet is required")
    @ManyToOne
    private Wallet wallet;

    @NotNull(message = "Category is required")
    @ManyToOne
    private Category category;

    @NotNull(message = "Category is required")
    @ManyToOne
    private User creator;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @NotBlank(message = "Value is required")
    @Positive(message = "Value must be positive")
    private BigDecimal value;

    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime transactionDate; 

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdDate;
    
}
