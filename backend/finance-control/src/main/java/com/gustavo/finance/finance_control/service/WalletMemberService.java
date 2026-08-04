package com.gustavo.finance.finance_control.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gustavo.finance.finance_control.dto.WalletMemberRequest;
import com.gustavo.finance.finance_control.dto.WalletMemberResponse;
import com.gustavo.finance.finance_control.dto.WalletMemberRoleRequest;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.ConflictException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@Service
public class WalletMemberService {

    private final UserWalletRepository userWalletRepository;
    private final UserRepository userRepository;

    public WalletMemberService(
        UserWalletRepository userWalletRepository,
        UserRepository userRepository
    ) {
        this.userWalletRepository = userWalletRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<WalletMemberResponse> list(User requester, Long walletId) {
        UserWallet requesterMembership = findMembership(requester, walletId);
        return userWalletRepository
            .findAllByWalletOrderByAssociationDateAsc(requesterMembership.getWallet())
            .stream()
            .map(WalletMemberResponse::from)
            .toList();
    }

    @Transactional
    public WalletMemberResponse add(
        User requester,
        Long walletId,
        WalletMemberRequest request
    ) {
        UserWallet ownerMembership = findOwnerMembership(requester, walletId);
        User newMember = userRepository.findByEmail(request.getEmail().trim())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (userWalletRepository.existsByWalletIdAndUser(walletId, newMember)) {
            throw new ConflictException("User is already a wallet member");
        }

        UserWallet membership = new UserWallet();
        membership.setWallet(ownerMembership.getWallet());
        membership.setUser(newMember);
        membership.setUserRelationWallet(request.getRole());
        membership.setAssociationDate(LocalDateTime.now());

        return WalletMemberResponse.from(userWalletRepository.save(membership));
    }

    @Transactional
    public WalletMemberResponse updateRole(
        User requester,
        Long walletId,
        Long userId,
        WalletMemberRoleRequest request
    ) {
        findOwnerMembership(requester, walletId);
        UserWallet membership = findMembership(walletId, userId);
        membership.setUserRelationWallet(request.getRole());
        return WalletMemberResponse.from(userWalletRepository.save(membership));
    }

    @Transactional
    public void remove(User requester, Long walletId, Long userId) {
        findOwnerMembership(requester, walletId);
        userWalletRepository.delete(findMembership(walletId, userId));
    }

    private UserWallet findMembership(User user, Long walletId) {
        return userWalletRepository.findByWalletIdAndUser(walletId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
    }

    private UserWallet findMembership(Long walletId, Long userId) {
        return userWalletRepository.findByWalletIdAndUserId(walletId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet member not found"));
    }

    private UserWallet findOwnerMembership(User user, Long walletId) {
        UserWallet membership = findMembership(user, walletId);
        if (membership.getUserRelationWallet() != UserRelationWallet.OWNER) {
            throw new AccessDeniedException("Only the wallet owner can perform this operation");
        }
        return membership;
    }
}
