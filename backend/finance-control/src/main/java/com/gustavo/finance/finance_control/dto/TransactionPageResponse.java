package com.gustavo.finance.finance_control.dto;

import java.util.List;
import org.springframework.data.domain.Page;
import lombok.Getter;

@Getter
public class TransactionPageResponse {
    private final List<TransactionResponse> content;
    private final long totalElements;
    private final int totalPages;
    private final int size;
    private final int number;
    private final int numberOfElements;
    private final boolean first;
    private final boolean last;
    private final boolean empty;

    public TransactionPageResponse(Page<TransactionResponse> page) {
        this.content = page.getContent();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.size = page.getSize();
        this.number = page.getNumber();
        this.numberOfElements = page.getNumberOfElements();
        this.first = page.isFirst();
        this.last = page.isLast();
        this.empty = page.isEmpty();
    }
}
