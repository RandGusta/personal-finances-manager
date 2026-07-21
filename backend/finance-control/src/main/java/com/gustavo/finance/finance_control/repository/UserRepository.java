package com.gustavo.finance.finance_control.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
}
