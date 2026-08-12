package com.gustavo.finance.finance_control.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gustavo.finance.finance_control.dto.WalletRequest;
import com.gustavo.finance.finance_control.dto.WalletResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.WalletInvitationRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;
import com.gustavo.finance.finance_control.repository.WalletRepository;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserWalletRepository userWalletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletInvitationRepository walletInvitationRepository;

    public WalletService(
        WalletRepository walletRepository,
        UserWalletRepository userWalletRepository,
        TransactionRepository transactionRepository,
        WalletInvitationRepository walletInvitationRepository
    ) {
        this.walletRepository = walletRepository;
        this.userWalletRepository = userWalletRepository;
        this.transactionRepository = transactionRepository;
        this.walletInvitationRepository = walletInvitationRepository;
    }

    @Transactional(readOnly = true)
    public List<WalletResponse> list(User user) {
        return userWalletRepository.findAllByUserOrderByAssociationDateDesc(user)
            .stream()
            .map(membership -> WalletResponse.from(
                membership,
                userWalletRepository.countByWallet(membership.getWallet())
            ))
            .toList();
    }

    @Transactional
    public WalletResponse create(User user, WalletRequest request) {
        Wallet wallet = new Wallet();
        copyRequest(wallet, request);
        wallet.setCreatedDate(LocalDateTime.now());
        Wallet savedWallet = walletRepository.save(wallet);

        UserWallet ownerMembership = new UserWallet();
        ownerMembership.setWallet(savedWallet);
        ownerMembership.setUser(user);
        ownerMembership.setUserRelationWallet(UserRelationWallet.OWNER);
        ownerMembership.setAssociationDate(LocalDateTime.now());
        UserWallet savedMembership = userWalletRepository.save(ownerMembership);

        return WalletResponse.from(savedMembership, 1);
    }

    @Transactional(readOnly = true)
    public WalletResponse get(User user, Long walletId) {
        UserWallet membership = findMembership(user, walletId);
        return WalletResponse.from(
            membership,
            userWalletRepository.countByWallet(membership.getWallet())
        );
    }

    @Transactional
    public WalletResponse update(User user, Long walletId, WalletRequest request) {
        UserWallet membership = findOwnerMembership(user, walletId);
        Wallet wallet = membership.getWallet();
        copyRequest(wallet, request);
        walletRepository.save(wallet);

        return WalletResponse.from(
            membership,
            userWalletRepository.countByWallet(wallet)
        );
    }

    @Transactional
    public void delete(User user, Long walletId) {
        UserWallet membership = findOwnerMembership(user, walletId);
        Wallet wallet = membership.getWallet();

        transactionRepository.deleteAllByWallet(wallet);
        walletInvitationRepository.deleteAllByWallet(wallet);
        userWalletRepository.deleteAllByWallet(wallet);
        walletRepository.delete(wallet);
    }

    private UserWallet findMembership(User user, Long walletId) {
        return userWalletRepository.findByWalletIdAndUser(walletId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
    }

    private UserWallet findOwnerMembership(User user, Long walletId) {
        UserWallet membership = findMembership(user, walletId);
        if (membership.getUserRelationWallet() != UserRelationWallet.OWNER) {
            throw new AccessDeniedException("Only the wallet owner can perform this operation");
        }
        return membership;
    }

    private void copyRequest(Wallet wallet, WalletRequest request) {
        wallet.setName(request.getName().trim());
        wallet.setDescription(normalizeOptionalText(request.getDescription()));
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
