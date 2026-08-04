package com.gustavo.finance.finance_control.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;

public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {

    List<UserWallet> findAllByUserOrderByAssociationDateDesc(User user);

    Optional<UserWallet> findByWalletIdAndUser(Long walletId, User user);

    Optional<UserWallet> findByWalletIdAndUserId(Long walletId, Long userId);

    List<UserWallet> findAllByWalletOrderByAssociationDateAsc(Wallet wallet);

    boolean existsByWalletIdAndUser(Long walletId, User user);

    long countByWallet(Wallet wallet);

    void deleteAllByWallet(Wallet wallet);
}
