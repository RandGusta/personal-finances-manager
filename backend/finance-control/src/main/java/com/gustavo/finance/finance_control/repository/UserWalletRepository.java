package com.gustavo.finance.finance_control.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gustavo.finance.finance_control.entity.UserWallet;

public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {
    
}
