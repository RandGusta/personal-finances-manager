package com.gustavo.finance.finance_control.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.RedifinationPasswordToken;

public interface RedifinationPasswordTokenRepository extends JpaRepository<RedifinationPasswordToken, Long> {

    Optional<RedifinationPasswordToken> findByToken(String token);
}
