package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

import com.gustavo.finance.finance_control.dto.WalletMemberRequest;
import com.gustavo.finance.finance_control.dto.WalletMemberResponse;
import com.gustavo.finance.finance_control.dto.WalletMemberRoleRequest;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.ConflictException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@ExtendWith(MockitoExtension.class)
class WalletMemberServiceTest {

    @Mock
    private UserWalletRepository userWalletRepository;

    @Mock
    private UserRepository userRepository;

    private WalletMemberService walletMemberService;
    private User requester;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        walletMemberService = new WalletMemberService(userWalletRepository, userRepository);

        requester = user(1L, "Owner", "owner@example.com");
        wallet = new Wallet();
        wallet.setId(10L);
        wallet.setName("Shared wallet");
    }

    @Test
    void shouldListMembersWhenRequesterBelongsToWallet() {
        UserWallet requesterMembership = membership(requester, UserRelationWallet.VIEWER);
        User editor = user(2L, "Editor", "editor@example.com");
        UserWallet editorMembership = membership(editor, UserRelationWallet.EDITOR);
        when(userWalletRepository.findByWalletIdAndUser(10L, requester))
            .thenReturn(Optional.of(requesterMembership));
        when(userWalletRepository.findAllByWalletOrderByAssociationDateAsc(wallet))
            .thenReturn(List.of(requesterMembership, editorMembership));

        List<WalletMemberResponse> response = walletMemberService.list(requester, 10L);

        assertEquals(2, response.size());
        assertEquals("editor@example.com", response.get(1).getEmail());
        assertEquals(UserRelationWallet.EDITOR, response.get(1).getRole());
    }

    @Test
    void shouldHideMemberListFromNonMember() {
        when(userWalletRepository.findByWalletIdAndUser(10L, requester))
            .thenReturn(Optional.empty());

        assertThrows(
            ResourceNotFoundException.class,
            () -> walletMemberService.list(requester, 10L)
        );
    }

    @Test
    void shouldRejectAddingMemberWhenRequesterIsNotOwner() {
        when(userWalletRepository.findByWalletIdAndUser(10L, requester))
            .thenReturn(Optional.of(membership(requester, UserRelationWallet.EDITOR)));

        assertThrows(
            AccessDeniedException.class,
            () -> walletMemberService.add(
                requester,
                10L,
                memberRequest("new@example.com", UserRelationWallet.VIEWER)
            )
        );

        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void shouldReturnNotFoundWhenMemberEmailDoesNotExist() {
        mockRequesterAsOwner();
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(
            ResourceNotFoundException.class,
            () -> walletMemberService.add(
                requester,
                10L,
                memberRequest(" missing@example.com ", UserRelationWallet.VIEWER)
            )
        );
    }

    @Test
    void shouldRejectDuplicatedWalletMember() {
        User existingMember = user(2L, "Existing", "existing@example.com");
        mockRequesterAsOwner();
        when(userRepository.findByEmail("existing@example.com"))
            .thenReturn(Optional.of(existingMember));
        when(userWalletRepository.existsByWalletIdAndUser(10L, existingMember))
            .thenReturn(true);

        assertThrows(
            ConflictException.class,
            () -> walletMemberService.add(
                requester,
                10L,
                memberRequest("existing@example.com", UserRelationWallet.EDITOR)
            )
        );

        verify(userWalletRepository, never()).save(any());
    }

    @Test
    void shouldAddMemberWithRequestedRole() {
        User newMember = user(2L, "New member", "new@example.com");
        mockRequesterAsOwner();
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.of(newMember));
        when(userWalletRepository.existsByWalletIdAndUser(10L, newMember)).thenReturn(false);
        when(userWalletRepository.save(any(UserWallet.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        WalletMemberResponse response = walletMemberService.add(
            requester,
            10L,
            memberRequest("new@example.com", UserRelationWallet.EDITOR)
        );

        ArgumentCaptor<UserWallet> captor = ArgumentCaptor.forClass(UserWallet.class);
        verify(userWalletRepository).save(captor.capture());
        assertSame(wallet, captor.getValue().getWallet());
        assertSame(newMember, captor.getValue().getUser());
        assertEquals(UserRelationWallet.EDITOR, response.getRole());
    }

    @Test
    void shouldAllowOwnerToChangeMemberRole() {
        User member = user(2L, "Member", "member@example.com");
        UserWallet membership = membership(member, UserRelationWallet.VIEWER);
        WalletMemberRoleRequest request = new WalletMemberRoleRequest();
        request.setRole(UserRelationWallet.EDITOR);
        mockRequesterAsOwner();
        when(userWalletRepository.findByWalletIdAndUserId(10L, 2L))
            .thenReturn(Optional.of(membership));
        when(userWalletRepository.save(membership)).thenReturn(membership);

        WalletMemberResponse response = walletMemberService.updateRole(
            requester,
            10L,
            2L,
            request
        );

        assertEquals(UserRelationWallet.EDITOR, response.getRole());
        verify(userWalletRepository).save(membership);
    }

    @Test
    void shouldAllowOwnerToRemoveMember() {
        User member = user(2L, "Member", "member@example.com");
        UserWallet membership = membership(member, UserRelationWallet.VIEWER);
        mockRequesterAsOwner();
        when(userWalletRepository.findByWalletIdAndUserId(10L, 2L))
            .thenReturn(Optional.of(membership));

        walletMemberService.remove(requester, 10L, 2L);

        verify(userWalletRepository).delete(membership);
    }

    private void mockRequesterAsOwner() {
        when(userWalletRepository.findByWalletIdAndUser(10L, requester))
            .thenReturn(Optional.of(membership(requester, UserRelationWallet.OWNER)));
    }

    private User user(Long id, String name, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(name);
        user.setEmail(email);
        return user;
    }

    private UserWallet membership(User user, UserRelationWallet role) {
        UserWallet membership = new UserWallet();
        membership.setWallet(wallet);
        membership.setUser(user);
        membership.setUserRelationWallet(role);
        membership.setAssociationDate(LocalDateTime.now());
        return membership;
    }

    private WalletMemberRequest memberRequest(String email, UserRelationWallet role) {
        WalletMemberRequest request = new WalletMemberRequest();
        request.setEmail(email);
        request.setRole(role);
        return request;
    }
}
