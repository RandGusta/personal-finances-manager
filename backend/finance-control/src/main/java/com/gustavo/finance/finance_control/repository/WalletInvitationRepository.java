package com.gustavo.finance.finance_control.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.entity.WalletInvitation;

public interface WalletInvitationRepository extends JpaRepository<WalletInvitation, Long> {

    Optional<WalletInvitation> findByToken(String token);

    Optional<WalletInvitation>
        findFirstByWalletIdAndEmailIgnoreCaseAndAcceptedFalseOrderByCreatedAtDesc(
            Long walletId,
            String email
        );

    void deleteAllByWallet(Wallet wallet);
}
