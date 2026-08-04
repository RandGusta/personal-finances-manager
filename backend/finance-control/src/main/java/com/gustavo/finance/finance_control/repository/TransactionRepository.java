package com.gustavo.finance.finance_control.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.Wallet;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findBycreatedBy(User user);

    boolean existsByCategory(Category category);

    void deleteAllByWallet(Wallet wallet);
}
