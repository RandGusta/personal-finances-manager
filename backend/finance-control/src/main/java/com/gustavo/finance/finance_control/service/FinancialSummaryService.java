package com.gustavo.finance.finance_control.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

        Specification<Transaction> filters = Specification
            .where(hasWallet(walletId))
            .and(dateOnOrAfter(startDate))
            .and(dateOnOrBefore(endDate));
        List<Transaction> transactions = transactionRepository.findAll(
            filters,
            Sort.by(Sort.Direction.ASC, "date")
        );

        return summarize(transactions);
    }

    private FinancialSummaryResponse summarize(List<Transaction> transactions) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<CategoryKey, BigDecimal> byCategory = new HashMap<>();
        Map<YearMonth, MonthlyTotals> byMonth = new TreeMap<>();

        for (Transaction transaction : transactions) {
            BigDecimal amount = transaction.getAmount();
            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(amount);
            } else {
                totalExpense = totalExpense.add(amount);
            }

            CategoryKey categoryKey = categoryKey(transaction.getCategory());
            byCategory.merge(categoryKey, amount, BigDecimal::add);

            YearMonth month = YearMonth.from(transaction.getDate());
            byMonth.computeIfAbsent(month, ignored -> new MonthlyTotals())
                .add(transaction.getType(), amount);
        }

        return new FinancialSummaryResponse(
            totalIncome,
            totalExpense,
            totalIncome.subtract(totalExpense),
            transactions.size(),
            categoryResponses(byCategory),
            monthlyResponses(byMonth)
        );
    }

    private List<CategorySummaryResponse> categoryResponses(
        Map<CategoryKey, BigDecimal> totals
    ) {
        return totals.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> new CategorySummaryResponse(
                entry.getKey().id(),
                entry.getKey().name(),
                entry.getValue()
            ))
            .toList();
    }

    private List<MonthlySummaryResponse> monthlyResponses(
        Map<YearMonth, MonthlyTotals> totals
    ) {
        return totals.entrySet().stream()
            .map(entry -> new MonthlySummaryResponse(
                entry.getKey().toString(),
                entry.getValue().income,
                entry.getValue().expense
            ))
            .toList();
    }

    private CategoryKey categoryKey(Category category) {
        return category == null
            ? new CategoryKey(null, UNCATEGORIZED)
            : new CategoryKey(category.getId(), category.getName());
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

    private Specification<Transaction> hasWallet(Long walletId) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("wallet").get("id"), walletId);
    }

    private Specification<Transaction> dateOnOrAfter(LocalDate startDate) {
        return startDate == null
            ? Specification.unrestricted()
            : (root, query, criteriaBuilder) ->
            criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate);
    }

    private Specification<Transaction> dateOnOrBefore(LocalDate endDate) {
        return endDate == null
            ? Specification.unrestricted()
            : (root, query, criteriaBuilder) ->
            criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate);
    }

    private record CategoryKey(Long id, String name) implements Comparable<CategoryKey> {

        @Override
        public int compareTo(CategoryKey other) {
            int nameComparison = name.compareToIgnoreCase(other.name);
            if (nameComparison != 0) {
                return nameComparison;
            }
            if (id == null) {
                return other.id == null ? 0 : -1;
            }
            return other.id == null ? 1 : id.compareTo(other.id);
        }
    }

    private static class MonthlyTotals {

        private BigDecimal income = BigDecimal.ZERO;
        private BigDecimal expense = BigDecimal.ZERO;

        private void add(TransactionType type, BigDecimal amount) {
            if (type == TransactionType.INCOME) {
                income = income.add(amount);
            } else {
                expense = expense.add(amount);
            }
        }
    }
}
