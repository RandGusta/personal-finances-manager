package com.gustavo.finance.finance_control.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gustavo.finance.finance_control.dto.CategorySummaryResponse;
import com.gustavo.finance.finance_control.dto.FinancialSummaryResponse;
import com.gustavo.finance.finance_control.dto.MonthlySummaryResponse;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@Service
public class FinancialSummaryService {

    private static final String UNCATEGORIZED = "Uncategorized";

    private final TransactionRepository transactionRepository;
    private final UserWalletRepository userWalletRepository;

    public FinancialSummaryService(
        TransactionRepository transactionRepository,
        UserWalletRepository userWalletRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userWalletRepository = userWalletRepository;
    }

    @Transactional(readOnly = true)
    public FinancialSummaryResponse get(
        User user,
        Long walletId,
        LocalDate startDate,
        LocalDate endDate
    ) {
        validateMembership(user, walletId);
        validateDateRange(startDate, endDate);

        List<Transaction> transactions = findTransactions(walletId, startDate, endDate);
        return summarize(transactions);
    }

    private List<Transaction> findTransactions(
        Long walletId,
        LocalDate startDate,
        LocalDate endDate
    ) {
        if (startDate != null && endDate != null) {
            return transactionRepository.findAllByWalletIdAndDateBetweenOrderByDateAsc(
                walletId,
                startDate,
                endDate
            );
        }

        if (startDate != null) {
            return transactionRepository
                .findAllByWalletIdAndDateGreaterThanEqualOrderByDateAsc(walletId, startDate);
        }

        if (endDate != null) {
            return transactionRepository
                .findAllByWalletIdAndDateLessThanEqualOrderByDateAsc(walletId, endDate);
        }

        return transactionRepository.findAllByWalletIdOrderByDateAsc(walletId);
    }

    private FinancialSummaryResponse summarize(List<Transaction> transactions) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        Map<Long, CategorySummaryResponse> categories = new LinkedHashMap<>();
        Map<String, MonthlySummaryResponse> months = new LinkedHashMap<>();

        for (Transaction transaction : transactions) {
            BigDecimal amount = transaction.getAmount();

            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(amount);
            } else {
                totalExpense = totalExpense.add(amount);
            }

            addCategoryTotal(categories, transaction);
            addMonthlyTotal(months, transaction);
        }

        List<CategorySummaryResponse> categoryList = new ArrayList<>(categories.values());
        List<MonthlySummaryResponse> monthList = new ArrayList<>(months.values());
        BigDecimal balance = totalIncome.subtract(totalExpense);

        return new FinancialSummaryResponse(
            totalIncome,
            totalExpense,
            balance,
            transactions.size(),
            categoryList,
            monthList
        );
    }

    private void addCategoryTotal(
        Map<Long, CategorySummaryResponse> categories,
        Transaction transaction
    ) {
        Category category = transaction.getCategory();
        Long categoryId = null;
        String categoryName = UNCATEGORIZED;

        if (category != null) {
            categoryId = category.getId();
            categoryName = category.getName();
        }

        CategorySummaryResponse summary = categories.get(categoryId);

        if (summary == null) {
            summary = new CategorySummaryResponse(
                categoryId,
                categoryName,
                transaction.getAmount()
            );
            categories.put(categoryId, summary);
        } else {
            BigDecimal newTotal = summary.getTotal().add(transaction.getAmount());
            summary.setTotal(newTotal);
        }
    }

    private void addMonthlyTotal(
        Map<String, MonthlySummaryResponse> months,
        Transaction transaction
    ) {
        String month = YearMonth.from(transaction.getDate()).toString();
        MonthlySummaryResponse summary = months.get(month);

        if (summary == null) {
            summary = new MonthlySummaryResponse(
                month,
                BigDecimal.ZERO,
                BigDecimal.ZERO
            );
            months.put(month, summary);
        }

        if (transaction.getType() == TransactionType.INCOME) {
            BigDecimal newIncome = summary.getIncome().add(transaction.getAmount());
            summary.setIncome(newIncome);
        } else {
            BigDecimal newExpense = summary.getExpense().add(transaction.getAmount());
            summary.setExpense(newExpense);
        }
    }

    private void validateMembership(User user, Long walletId) {
        if (userWalletRepository.findByWalletIdAndUser(walletId, user).isEmpty()) {
            throw new ResourceNotFoundException("Wallet not found");
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException("Start date cannot be after end date");
        }
    }
}
