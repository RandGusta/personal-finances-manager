package com.gustavo.finance.finance_control.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gustavo.finance.finance_control.entity.Category;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.enums.TransactionType;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByUserOrderByNameAsc(User user);

    List<Category> findAllByUserAndTypeOrderByNameAsc(User user, TransactionType type);

    Optional<Category> findByIdAndUser(Long id, User user);
}
