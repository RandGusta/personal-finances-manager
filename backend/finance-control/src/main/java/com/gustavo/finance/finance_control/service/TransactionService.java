package com.gustavo.finance.finance_control.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gustavo.finance.finance_control.dto.TransactionRequest;
import com.gustavo.finance.finance_control.dto.TransactionResponse;
import com.gustavo.finance.finance_control.enums.TransactionType;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.repository.CategoryRepository;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserWalletRepository userWalletRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(
        TransactionRepository transactionRepository,
        UserWalletRepository userWalletRepository,
        CategoryRepository categoryRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userWalletRepository = userWalletRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> list(
        User user,
        Long walletId,
        TransactionType type,
        Long categoryId,
        LocalDate startDate,
        LocalDate endDate,
        Pageable pageable
    ) {
        findMembership(user, walletId);
        validateDateRange(startDate, endDate);

        Specification<Transaction> filters = Specification
            .where(hasWallet(walletId))
            .and(hasType(type))
            .and(hasCategory(categoryId))
            .and(dateOnOrAfter(startDate))
            .and(dateOnOrBefore(endDate));

        return transactionRepository.findAll(filters, pageable)
            .map(TransactionResponse::from);
    }

    @Transactional
    public TransactionResponse create(User user, Long walletId, TransactionRequest request) {
        UserWallet membership = findWritableMembership(user, walletId);
        Transaction transaction = new Transaction();
        transaction.setWallet(membership.getWallet());
        transaction.setCreatedBy(user);
        transaction.setCreatedDate(LocalDateTime.now());
        copyRequest(transaction, user, request);
        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public TransactionResponse get(User user, Long walletId, Long transactionId) {
        findMembership(user, walletId);
        return TransactionResponse.from(findTransaction(walletId, transactionId));
    }

    @Transactional
    public TransactionResponse update(
        User user,
        Long walletId,
        Long transactionId,
        TransactionRequest request
    ) {
        findWritableMembership(user, walletId);
        Transaction transaction = findTransaction(walletId, transactionId);
        copyRequest(transaction, user, request);
        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(User user, Long walletId, Long transactionId) {
        findWritableMembership(user, walletId);
        transactionRepository.delete(findTransaction(walletId, transactionId));
    }

    private void copyRequest(Transaction transaction, User user, TransactionRequest request) {
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(normalizeOptionalText(request.getDescription()));
        transaction.setDate(request.getDate());
        transaction.setCategory(findCategory(
            user,
            request.getCategoryId(),
            transaction.getCategory()
        ));
    }

    private Category findCategory(User user, Long categoryId, Category currentCategory) {
        if (categoryId == null) {
            throw new BusinessException("Category is required");
        }
        if (currentCategory != null && categoryId.equals(currentCategory.getId())) {
            return currentCategory;
        }
        return categoryRepository.findByIdAndUser(categoryId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private Transaction findTransaction(Long walletId, Long transactionId) {
        return transactionRepository.findByIdAndWalletId(transactionId, walletId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private UserWallet findMembership(User user, Long walletId) {
        return userWalletRepository.findByWalletIdAndUser(walletId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
    }

    private UserWallet findWritableMembership(User user, Long walletId) {
        UserWallet membership = findMembership(user, walletId);
        if (membership.getUserRelationWallet() == UserRelationWallet.VIEWER) {
            throw new AccessDeniedException(
                "Only wallet owners and editors can modify transactions"
            );
        }
        return membership;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException("Start date cannot be after end date");
        }
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Specification<Transaction> hasWallet(Long walletId) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("wallet").get("id"), walletId);
    }

    private Specification<Transaction> hasType(TransactionType type) {
        return type == null ? Specification.unrestricted() : (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("type"), type);
    }

    private Specification<Transaction> hasCategory(Long categoryId) {
        return categoryId == null
            ? Specification.unrestricted()
            : (root, query, criteriaBuilder) ->
            criteriaBuilder.equal(root.get("category").get("id"), categoryId);
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
}
