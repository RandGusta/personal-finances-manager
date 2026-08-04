package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.gustavo.finance.finance_control.dto.WalletRequest;
import com.gustavo.finance.finance_control.dto.WalletResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.TransactionRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;
import com.gustavo.finance.finance_control.repository.WalletRepository;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserWalletRepository userWalletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    private WalletService walletService;
    private User user;

    @BeforeEach
    void setUp() {
        walletService = new WalletService(
            walletRepository,
            userWalletRepository,
            transactionRepository
        );

        user = new User();
        user.setId(1L);
        user.setEmail("gustavo@example.com");
    }

    @Test
    void shouldListOnlyWalletsWhereUserIsMember() {
        UserWallet membership = membership(wallet(10L, "Personal"), UserRelationWallet.OWNER);
        when(userWalletRepository.findAllByUserOrderByAssociationDateDesc(user))
            .thenReturn(List.of(membership));
        when(userWalletRepository.countByWallet(membership.getWallet())).thenReturn(2L);

        List<WalletResponse> response = walletService.list(user);

        assertEquals(1, response.size());
        assertEquals("Personal", response.get(0).getName());
        assertEquals(2L, response.get(0).getMemberCount());
    }

    @Test
    void shouldCreateWalletAndMakeAuthenticatedUserOwner() {
        WalletRequest request = request("  Family  ", "   ");
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> {
            Wallet wallet = invocation.getArgument(0);
            wallet.setId(20L);
            return wallet;
        });
        when(userWalletRepository.save(any(UserWallet.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        WalletResponse response = walletService.create(user, request);

        ArgumentCaptor<UserWallet> membershipCaptor = ArgumentCaptor.forClass(UserWallet.class);
        verify(userWalletRepository).save(membershipCaptor.capture());
        UserWallet ownerMembership = membershipCaptor.getValue();

        assertSame(user, ownerMembership.getUser());
        assertEquals(UserRelationWallet.OWNER, ownerMembership.getUserRelationWallet());
        assertEquals("Family", response.getName());
        assertNull(response.getDescription());
        assertEquals(1L, response.getMemberCount());
    }

    @Test
    void shouldHideWalletFromNonMember() {
        when(userWalletRepository.findByWalletIdAndUser(30L, user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> walletService.get(user, 30L));
    }

    @Test
    void shouldRejectUpdateFromNonOwner() {
        Wallet wallet = wallet(40L, "Shared");
        UserWallet membership = membership(wallet, UserRelationWallet.EDITOR);
        when(userWalletRepository.findByWalletIdAndUser(40L, user))
            .thenReturn(Optional.of(membership));

        assertThrows(
            AccessDeniedException.class,
            () -> walletService.update(user, 40L, request("Updated", null))
        );

        verify(walletRepository, never()).save(wallet);
    }

    @Test
    void shouldAllowOwnerToUpdateWallet() {
        Wallet wallet = wallet(50L, "Old name");
        UserWallet membership = membership(wallet, UserRelationWallet.OWNER);
        when(userWalletRepository.findByWalletIdAndUser(50L, user))
            .thenReturn(Optional.of(membership));
        when(userWalletRepository.countByWallet(wallet)).thenReturn(1L);

        WalletResponse response = walletService.update(
            user,
            50L,
            request("New name", "New description")
        );

        assertEquals("New name", response.getName());
        assertEquals("New description", response.getDescription());
        verify(walletRepository).save(wallet);
    }

    @Test
    void shouldAllowOwnerToDeleteWalletAndRelatedData() {
        Wallet wallet = wallet(60L, "Disposable");
        UserWallet membership = membership(wallet, UserRelationWallet.OWNER);
        when(userWalletRepository.findByWalletIdAndUser(60L, user))
            .thenReturn(Optional.of(membership));

        walletService.delete(user, 60L);

        verify(transactionRepository).deleteAllByWallet(wallet);
        verify(userWalletRepository).deleteAllByWallet(wallet);
        verify(walletRepository).delete(wallet);
    }

    private Wallet wallet(Long id, String name) {
        Wallet wallet = new Wallet();
        wallet.setId(id);
        wallet.setName(name);
        wallet.setCreatedDate(LocalDateTime.now());
        return wallet;
    }

    private UserWallet membership(Wallet wallet, UserRelationWallet role) {
        UserWallet membership = new UserWallet();
        membership.setWallet(wallet);
        membership.setUser(user);
        membership.setUserRelationWallet(role);
        membership.setAssociationDate(LocalDateTime.now());
        return membership;
    }

    private WalletRequest request(String name, String description) {
        WalletRequest request = new WalletRequest();
        request.setName(name);
        request.setDescription(description);
        return request;
    }
}
