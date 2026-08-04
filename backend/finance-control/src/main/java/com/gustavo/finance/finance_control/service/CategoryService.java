package com.gustavo.finance.finance_control.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gustavo.finance.finance_control.dto.CategoryRequest;
import com.gustavo.finance.finance_control.dto.CategoryResponse;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.CategoryRepository;
import com.gustavo.finance.finance_control.repository.TransactionRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public CategoryService(
        CategoryRepository categoryRepository,
        TransactionRepository transactionRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(User user, TransactionType type) {
        List<Category> categories = type == null
            ? categoryRepository.findAllByUserOrderByNameAsc(user)
            : categoryRepository.findAllByUserAndTypeOrderByNameAsc(user, type);

        return categories.stream()
            .map(CategoryResponse::from)
            .toList();
    }

    @Transactional
    public CategoryResponse create(User user, CategoryRequest request) {
        Category category = new Category();
        category.setUser(user);
        copyRequest(category, request);

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(User user, Long id, CategoryRequest request) {
        Category category = findOwnedCategory(user, id);
        copyRequest(category, request);

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void delete(User user, Long id) {
        Category category = findOwnedCategory(user, id);

        if (transactionRepository.existsByCategory(category)) {
            throw new BusinessException(
                "Category cannot be deleted because it has linked transactions"
            );
        }

        categoryRepository.delete(category);
    }

    private Category findOwnedCategory(User user, Long id) {
        return categoryRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void copyRequest(Category category, CategoryRequest request) {
        category.setName(request.getName().trim());
        category.setType(request.getType());
        category.setColor(normalizeOptionalText(request.getColor()));
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
