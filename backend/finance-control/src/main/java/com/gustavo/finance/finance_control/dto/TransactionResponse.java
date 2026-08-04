package com.gustavo.finance.finance_control.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private Long walletId;
    private Long categoryId;
    private String categoryName;
    private Long createdById;
    private String createdByName;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private LocalDate date;
    private LocalDateTime createdAt;

    public static TransactionResponse from(Transaction transaction) {
        Category category = transaction.getCategory();
        User createdBy = transaction.getCreatedBy();
        return new TransactionResponse(
            transaction.getId(),
            transaction.getWallet().getId(),
            category == null ? null : category.getId(),
            category == null ? null : category.getName(),
            createdBy.getId(),
            createdBy.getUsername(),
            transaction.getType(),
            transaction.getAmount(),
            transaction.getDescription(),
            transaction.getDate(),
            transaction.getCreatedDate()
        );
    }
}
