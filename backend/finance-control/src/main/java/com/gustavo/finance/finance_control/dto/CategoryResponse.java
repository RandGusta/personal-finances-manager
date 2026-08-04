package com.gustavo.finance.finance_control.dto;

import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.enums.TransactionType;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private TransactionType type;
    private String color;

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getType(),
            category.getColor()
        );
    }
}
