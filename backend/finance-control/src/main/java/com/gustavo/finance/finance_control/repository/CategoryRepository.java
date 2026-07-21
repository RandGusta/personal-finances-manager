package com.gustavo.finance.finance_control.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
}
