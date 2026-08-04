package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;

import com.gustavo.finance.finance_control.dto.TransactionRequest;
import com.gustavo.finance.finance_control.dto.TransactionResponse;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.CategoryRepository;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserWalletRepository userWalletRepository;

    @Mock
    private CategoryRepository categoryRepository;

    private TransactionService transactionService;
    private User user;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(
            transactionRepository,
            userWalletRepository,
            categoryRepository
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
    void shouldListPaginatedTransactionsForViewer() {
        mockMembership(UserRelationWallet.VIEWER);
        Pageable pageable = PageRequest.of(0, 20);
        Transaction transaction = transaction(100L, TransactionType.EXPENSE);
        when(transactionRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(new PageImpl<>(List.of(transaction), pageable, 1));

        Page<TransactionResponse> response = transactionService.list(
            user,
            10L,
            TransactionType.EXPENSE,
            null,
            LocalDate.now().minusDays(30),
            LocalDate.now(),
            pageable
        );

        assertEquals(1, response.getTotalElements());
        assertEquals(TransactionType.EXPENSE, response.getContent().get(0).getType());
    }

    @Test
    void shouldRejectInvalidDateRange() {
        mockMembership(UserRelationWallet.OWNER);

        assertThrows(
            BusinessException.class,
            () -> transactionService.list(
                user,
                10L,
                null,
                null,
                LocalDate.now(),
                LocalDate.now().minusDays(1),
                PageRequest.of(0, 20)
            )
        );

        verify(transactionRepository, never()).findAll(
            any(Specification.class),
            any(Pageable.class)
        );
    }

    @Test
    void shouldRejectCreateFromViewer() {
        mockMembership(UserRelationWallet.VIEWER);

        assertThrows(
            AccessDeniedException.class,
            () -> transactionService.create(user, 10L, request(null))
        );

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void shouldCreateTransactionForEditorWithoutCategory() {
        mockMembership(UserRelationWallet.EDITOR);
        when(transactionRepository.save(any(Transaction.class)))
            .thenAnswer(invocation -> {
                Transaction transaction = invocation.getArgument(0);
                transaction.setId(101L);
                return transaction;
            });

        TransactionResponse response = transactionService.create(user, 10L, request(null));

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertSame(wallet, captor.getValue().getWallet());
        assertSame(user, captor.getValue().getCreatedBy());
        assertNull(captor.getValue().getCategory());
        assertEquals(new BigDecimal("150.00"), response.getAmount());
    }

    @Test
    void shouldRejectCategoryOwnedByAnotherUser() {
        mockMembership(UserRelationWallet.OWNER);
        when(categoryRepository.findByIdAndUser(5L, user)).thenReturn(Optional.empty());

        assertThrows(
            ResourceNotFoundException.class,
            () -> transactionService.create(user, 10L, request(5L))
        );

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void shouldCreateTransactionWithOwnedCategory() {
        Category category = category(5L, "Food");
        mockMembership(UserRelationWallet.OWNER);
        when(categoryRepository.findByIdAndUser(5L, user)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = transactionService.create(user, 10L, request(5L));

        assertEquals(5L, response.getCategoryId());
        assertEquals("Food", response.getCategoryName());
    }

    @Test
    void shouldReturnTransactionDetailsForMember() {
        Transaction transaction = transaction(102L, TransactionType.INCOME);
        mockMembership(UserRelationWallet.VIEWER);
        when(transactionRepository.findByIdAndWalletId(102L, 10L))
            .thenReturn(Optional.of(transaction));

        TransactionResponse response = transactionService.get(user, 10L, 102L);

        assertEquals(102L, response.getId());
        assertEquals(10L, response.getWalletId());
    }

    @Test
    void shouldAllowEditorToUpdateTransaction() {
        Transaction transaction = transaction(103L, TransactionType.INCOME);
        User originalCreator = new User();
        originalCreator.setId(2L);
        originalCreator.setUsername("Original creator");
        originalCreator.setEmail("creator@example.com");
        transaction.setCreatedBy(originalCreator);
        Category originalCategory = category(5L, "Original category");
        originalCategory.setUser(originalCreator);
        transaction.setCategory(originalCategory);
        mockMembership(UserRelationWallet.EDITOR);
        when(transactionRepository.findByIdAndWalletId(103L, 10L))
            .thenReturn(Optional.of(transaction));
        when(transactionRepository.save(transaction)).thenReturn(transaction);

        TransactionResponse response = transactionService.update(
            user,
            10L,
            103L,
            request(5L)
        );

        assertEquals(TransactionType.EXPENSE, response.getType());
        assertSame(originalCreator, transaction.getCreatedBy());
        assertSame(originalCategory, transaction.getCategory());
        verify(categoryRepository, never()).findByIdAndUser(any(), any());
        verify(transactionRepository).save(transaction);
    }

    @Test
    void shouldAllowOwnerToDeleteTransaction() {
        Transaction transaction = transaction(104L, TransactionType.EXPENSE);
        mockMembership(UserRelationWallet.OWNER);
        when(transactionRepository.findByIdAndWalletId(104L, 10L))
            .thenReturn(Optional.of(transaction));

        transactionService.delete(user, 10L, 104L);

        verify(transactionRepository).delete(transaction);
    }

    private void mockMembership(UserRelationWallet role) {
        UserWallet membership = new UserWallet();
        membership.setWallet(wallet);
        membership.setUser(user);
        membership.setUserRelationWallet(role);
        when(userWalletRepository.findByWalletIdAndUser(10L, user))
            .thenReturn(Optional.of(membership));
    }

    private TransactionRequest request(Long categoryId) {
        TransactionRequest request = new TransactionRequest();
        request.setType(TransactionType.EXPENSE);
        request.setAmount(new BigDecimal("150.00"));
        request.setDescription("  Supermarket  ");
        request.setDate(LocalDate.now());
        request.setCategoryId(categoryId);
        return request;
    }

    private Transaction transaction(Long id, TransactionType type) {
        Transaction transaction = new Transaction();
        transaction.setId(id);
        transaction.setWallet(wallet);
        transaction.setCreatedBy(user);
        transaction.setType(type);
        transaction.setAmount(new BigDecimal("150.00"));
        transaction.setDescription("Supermarket");
        transaction.setDate(LocalDate.now());
        transaction.setCreatedDate(LocalDateTime.now());
        return transaction;
    }

    private Category category(Long id, String name) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setUser(user);
        category.setType(TransactionType.EXPENSE);
        return category;
    }
}
