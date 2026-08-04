package com.gustavo.finance.finance_control.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.Wallet;

public interface TransactionRepository extends
    JpaRepository<Transaction, Long>,
    JpaSpecificationExecutor<Transaction> {
    
    List<Transaction> findBycreatedBy(User user);

    boolean existsByCategory(Category category);

    Optional<Transaction> findByIdAndWalletId(Long id, Long walletId);

    void deleteAllByWallet(Wallet wallet);
}
