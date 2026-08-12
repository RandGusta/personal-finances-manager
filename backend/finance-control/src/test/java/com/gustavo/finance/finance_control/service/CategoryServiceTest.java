package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gustavo.finance.finance_control.dto.CategoryRequest;
import com.gustavo.finance.finance_control.dto.CategoryResponse;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.CategoryRepository;
import com.gustavo.finance.finance_control.repository.TransactionRepository;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    private CategoryService categoryService;
    private User user;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(categoryRepository, transactionRepository);

        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
    }

    @Test
    void shouldListOnlyCategoriesWithRequestedType() {
        Category category = category(10L, user, "Salary", TransactionType.INCOME);
        when(categoryRepository.findAllByUserAndTypeOrderByNameAsc(user, TransactionType.INCOME))
            .thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.list(user, TransactionType.INCOME);

        assertEquals(1, result.size());
        assertEquals("Salary", result.get(0).getName());
        assertEquals(TransactionType.INCOME, result.get(0).getType());
    }

    @Test
    void shouldCreateCategoryForAuthenticatedUser() {
        CategoryRequest request = request("  Food  ", TransactionType.EXPENSE);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category savedCategory = invocation.getArgument(0);
            savedCategory.setId(20L);
            return savedCategory;
        });

        CategoryResponse result = categoryService.create(user, request);

        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(categoryCaptor.capture());

        assertSame(user, categoryCaptor.getValue().getUser());
        assertEquals("Food", categoryCaptor.getValue().getName());
        assertEquals(20L, result.getId());
    }

    @Test
    void shouldUpdateOnlyCategoryOwnedByAuthenticatedUser() {
        Category category = category(30L, user, "Food", TransactionType.EXPENSE);
        CategoryRequest request = request("Groceries", TransactionType.EXPENSE);
        when(categoryRepository.findByIdAndUser(30L, user)).thenReturn(Optional.of(category));
        when(categoryRepository.save(category)).thenReturn(category);

        CategoryResponse result = categoryService.update(user, 30L, request);

        assertEquals("Groceries", result.getName());
    }

    @Test
    void shouldHideCategoryOwnedByAnotherUser() {
        when(categoryRepository.findByIdAndUser(40L, user)).thenReturn(Optional.empty());

        assertThrows(
            ResourceNotFoundException.class,
            () -> categoryService.update(
                user,
                40L,
                request("Updated", TransactionType.INCOME)
            )
        );
    }

    @Test
    void shouldRejectDeletionWhenCategoryHasTransactions() {
        Category category = category(50L, user, "Food", TransactionType.EXPENSE);
        when(categoryRepository.findByIdAndUser(50L, user)).thenReturn(Optional.of(category));
        when(transactionRepository.existsByCategory(category)).thenReturn(true);

        assertThrows(BusinessException.class, () -> categoryService.delete(user, 50L));

        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void shouldDeleteCategoryWithoutTransactions() {
        Category category = category(60L, user, "Unused", TransactionType.EXPENSE);
        when(categoryRepository.findByIdAndUser(60L, user)).thenReturn(Optional.of(category));
        when(transactionRepository.existsByCategory(category)).thenReturn(false);

        categoryService.delete(user, 60L);

        verify(categoryRepository).delete(category);
    }

    private Category category(Long id, User owner, String name, TransactionType type) {
        Category category = new Category();
        category.setId(id);
        category.setUser(owner);
        category.setName(name);
        category.setType(type);
        return category;
    }

    private CategoryRequest request(String name, TransactionType type) {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setType(type);
        return request;
    }
}
