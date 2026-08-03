package com.gustavo.finance.finance_control.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.Transaction;
import com.gustavo.finance.finance_control.entity.User;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findBycreatedBy(User user);
}
