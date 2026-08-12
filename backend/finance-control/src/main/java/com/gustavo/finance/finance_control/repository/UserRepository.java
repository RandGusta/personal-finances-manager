package com.gustavo.finance.finance_control.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);
}
