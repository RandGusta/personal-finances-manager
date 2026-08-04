package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.gustavo.finance.finance_control.dto.CategorySummaryResponse;
import com.gustavo.finance.finance_control.dto.FinancialSummaryResponse;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@ExtendWith(MockitoExtension.class)
class FinancialSummaryServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserWalletRepository userWalletRepository;

    private FinancialSummaryService financialSummaryService;
    private User user;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        financialSummaryService = new FinancialSummaryService(
            transactionRepository,
            userWalletRepository
        );

        user = new User();
        user.setId(1L);
        user.setUsername("Gustavo");
        user.setEmail("gustavo@example.com");

        wallet = new Wallet();
        wallet.setId(10L);
        wallet.setName("Shared wallet");
    }

    @Test
    void shouldHideSummaryFromNonMember() {
        when(userWalletRepository.findByWalletIdAndUser(10L, user))
            .thenReturn(Optional.empty());

        assertThrows(
            ResourceNotFoundException.class,
            () -> financialSummaryService.get(user, 10L, null, null)
        );

        verify(transactionRepository, never()).findAll(
            any(Specification.class),
            any(Sort.class)
        );
    }

    @Test
    void shouldRejectInvalidDateRange() {
        mockMembership();

        assertThrows(
            BusinessException.class,
            () -> financialSummaryService.get(
                user,
                10L,
                LocalDate.of(2026, 2, 1),
                LocalDate.of(2026, 1, 1)
            )
        );
    }

    @Test
    void shouldReturnZeroSummaryWhenWalletHasNoTransactions() {
        mockMembership();
        when(transactionRepository.findAll(any(Specification.class), any(Sort.class)))
            .thenReturn(List.of());

        FinancialSummaryResponse response = financialSummaryService.get(
            user,
            10L,
            null,
            null
        );

        assertEquals(BigDecimal.ZERO, response.getTotalIncome());
        assertEquals(BigDecimal.ZERO, response.getTotalExpense());
        assertEquals(BigDecimal.ZERO, response.getBalance());
        assertEquals(0L, response.getTransactionCount());
        assertEquals(List.of(), response.getByCategory());
        assertEquals(List.of(), response.getByMonth());
    }

    @Test
    void shouldAggregateTotalsByCategoryAndMonth() {
        Category salary = category(1L, "Salary", TransactionType.INCOME);
        Category food = category(2L, "Food", TransactionType.EXPENSE);
        List<Transaction> transactions = List.of(
            transaction(TransactionType.INCOME, "5000.00", LocalDate.of(2026, 1, 5), salary),
            transaction(TransactionType.EXPENSE, "200.00", LocalDate.of(2026, 1, 10), food),
            transaction(TransactionType.EXPENSE, "100.00", LocalDate.of(2026, 2, 2), food),
            transaction(TransactionType.EXPENSE, "50.00", LocalDate.of(2026, 2, 3), null)
        );
        mockMembership();
        when(transactionRepository.findAll(any(Specification.class), any(Sort.class)))
            .thenReturn(transactions);

        FinancialSummaryResponse response = financialSummaryService.get(
            user,
            10L,
            LocalDate.of(2026, 1, 1),
            LocalDate.of(2026, 2, 28)
        );

        assertEquals(new BigDecimal("5000.00"), response.getTotalIncome());
        assertEquals(new BigDecimal("350.00"), response.getTotalExpense());
        assertEquals(new BigDecimal("4650.00"), response.getBalance());
        assertEquals(4L, response.getTransactionCount());
        assertEquals(new BigDecimal("300.00"), categoryTotal(response, "Food"));
        assertEquals(new BigDecimal("5000.00"), categoryTotal(response, "Salary"));
        assertEquals(new BigDecimal("50.00"), categoryTotal(response, "Uncategorized"));
        assertEquals("2026-01", response.getByMonth().get(0).getMonth());
        assertEquals(new BigDecimal("5000.00"), response.getByMonth().get(0).getIncome());
        assertEquals(new BigDecimal("200.00"), response.getByMonth().get(0).getExpense());
        assertEquals("2026-02", response.getByMonth().get(1).getMonth());
        assertEquals(BigDecimal.ZERO, response.getByMonth().get(1).getIncome());
        assertEquals(new BigDecimal("150.00"), response.getByMonth().get(1).getExpense());
    }

    private BigDecimal categoryTotal(FinancialSummaryResponse response, String categoryName) {
        return response.getByCategory().stream()
            .filter(item -> categoryName.equals(item.getCategoryName()))
            .map(CategorySummaryResponse::getTotal)
            .findFirst()
            .orElseThrow();
    }

    private void mockMembership() {
        UserWallet membership = new UserWallet();
        membership.setWallet(wallet);
        membership.setUser(user);
        membership.setUserRelationWallet(UserRelationWallet.VIEWER);
        when(userWalletRepository.findByWalletIdAndUser(10L, user))
            .thenReturn(Optional.of(membership));
    }

    private Transaction transaction(
        TransactionType type,
        String amount,
        LocalDate date,
        Category category
    ) {
        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setCreatedBy(user);
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setDate(date);
        transaction.setCategory(category);
        transaction.setCreatedDate(LocalDateTime.now());
        return transaction;
    }

    private Category category(Long id, String name, TransactionType type) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setType(type);
        category.setUser(user);
        return category;
    }
}
