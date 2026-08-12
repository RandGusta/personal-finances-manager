package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.thymeleaf.context.Context;

import com.gustavo.finance.finance_control.dto.MessageResponse;
import com.gustavo.finance.finance_control.dto.WalletInvitationRequest;
import com.gustavo.finance.finance_control.dto.WalletMemberResponse;
import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.entity.Wallet;
import com.gustavo.finance.finance_control.entity.WalletInvitation;
import com.gustavo.finance.finance_control.enums.UserRelationWallet;
import com.gustavo.finance.finance_control.exception.BusinessException;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;
import com.gustavo.finance.finance_control.repository.WalletInvitationRepository;

@ExtendWith(MockitoExtension.class)
class WalletInvitationServiceTest {

    @Mock
    private WalletInvitationRepository invitationRepository;

    @Mock
    private UserWalletRepository userWalletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailSenderService emailSenderService;

    private WalletInvitationService invitationService;
    private User owner;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        invitationService = new WalletInvitationService(
            invitationRepository,
            userWalletRepository,
            userRepository,
            emailSenderService,
            "http://localhost:5173"
        );

        owner = user(1L, "Owner", "owner@example.com");
        wallet = new Wallet();
        wallet.setId(10L);
        wallet.setName("Family wallet");
    }

    @Test
    void shouldRejectInvitationWhenRequesterIsNotOwner() {
        when(userWalletRepository.findByWalletIdAndUser(10L, owner))
            .thenReturn(Optional.of(membership(owner, UserRelationWallet.EDITOR)));

        assertThrows(
            AccessDeniedException.class,
            () -> invitationService.invite(
                owner,
                10L,
                request("friend@example.com", UserRelationWallet.VIEWER)
            )
        );

        verify(invitationRepository, never()).save(any(WalletInvitation.class));
    }

    @Test
    void shouldCreateInvitationAndSendEmail() {
        mockOwnerMembership();
        when(userRepository.findByEmailIgnoreCase("friend@example.com"))
            .thenReturn(Optional.empty());
        when(invitationRepository
            .findFirstByWalletIdAndEmailIgnoreCaseAndAcceptedFalseOrderByCreatedAtDesc(
                10L,
                "friend@example.com"
            ))
            .thenReturn(Optional.empty());
        when(invitationRepository.save(any(WalletInvitation.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        MessageResponse response = invitationService.invite(
            owner,
            10L,
            request(" Friend@Example.com ", UserRelationWallet.VIEWER)
        );

        ArgumentCaptor<WalletInvitation> invitationCaptor =
            ArgumentCaptor.forClass(WalletInvitation.class);
        verify(invitationRepository).save(invitationCaptor.capture());

        WalletInvitation invitation = invitationCaptor.getValue();
        assertEquals("friend@example.com", invitation.getEmail());
        assertEquals(UserRelationWallet.VIEWER, invitation.getRole());
        assertFalse(invitation.isAccepted());
        assertTrue(invitation.getExpiresAt().isAfter(LocalDateTime.now().plusDays(6)));
        assertEquals("Wallet invitation sent successfully.", response.getMessage());

        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
        verify(emailSenderService).sendEmailTemplate(
            eq("friend@example.com"),
            eq("Wallet invitation"),
            eq("walletInvitation"),
            contextCaptor.capture()
        );

        String expectedLink =
            "http://localhost:5173/wallet-invitations/" + invitation.getToken();
        assertEquals(expectedLink, contextCaptor.getValue().getVariable("invitationLink"));
    }

    @Test
    void shouldAcceptInvitationForMatchingUser() {
        User invitedUser = user(2L, "Friend", "friend@example.com");
        WalletInvitation invitation = invitation(
            "friend@example.com",
            UserRelationWallet.EDITOR,
            LocalDateTime.now().plusDays(1)
        );
        when(invitationRepository.findByToken("invite-token"))
            .thenReturn(Optional.of(invitation));
        when(userWalletRepository.existsByWalletIdAndUser(10L, invitedUser)).thenReturn(false);
        when(userWalletRepository.save(any(UserWallet.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        WalletMemberResponse response = invitationService.accept(invitedUser, "invite-token");

        assertEquals(UserRelationWallet.EDITOR, response.getRole());
        assertTrue(invitation.isAccepted());
        verify(invitationRepository).save(invitation);
    }

    @Test
    void shouldRejectInvitationForDifferentEmail() {
        User differentUser = user(3L, "Another user", "another@example.com");
        WalletInvitation invitation = invitation(
            "friend@example.com",
            UserRelationWallet.VIEWER,
            LocalDateTime.now().plusDays(1)
        );
        when(invitationRepository.findByToken("invite-token"))
            .thenReturn(Optional.of(invitation));

        assertThrows(
            AccessDeniedException.class,
            () -> invitationService.accept(differentUser, "invite-token")
        );

        verify(userWalletRepository, never()).save(any(UserWallet.class));
    }

    @Test
    void shouldRejectExpiredInvitation() {
        User invitedUser = user(2L, "Friend", "friend@example.com");
        WalletInvitation invitation = invitation(
            "friend@example.com",
            UserRelationWallet.VIEWER,
            LocalDateTime.now().minusMinutes(1)
        );
        when(invitationRepository.findByToken("invite-token"))
            .thenReturn(Optional.of(invitation));

        assertThrows(
            BusinessException.class,
            () -> invitationService.accept(invitedUser, "invite-token")
        );

        verify(userWalletRepository, never()).save(any(UserWallet.class));
    }

    private void mockOwnerMembership() {
        when(userWalletRepository.findByWalletIdAndUser(10L, owner))
            .thenReturn(Optional.of(membership(owner, UserRelationWallet.OWNER)));
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

    private WalletInvitationRequest request(String email, UserRelationWallet role) {
        WalletInvitationRequest request = new WalletInvitationRequest();
        request.setEmail(email);
        request.setRole(role);
        return request;
    }

    private WalletInvitation invitation(
        String email,
        UserRelationWallet role,
        LocalDateTime expiration
    ) {
        WalletInvitation invitation = new WalletInvitation();
        invitation.setWallet(wallet);
        invitation.setInvitedBy(owner);
        invitation.setEmail(email);
        invitation.setRole(role);
        invitation.setToken("invite-token");
        invitation.setCreatedAt(LocalDateTime.now().minusMinutes(1));
        invitation.setExpiresAt(expiration);
        invitation.setAccepted(false);
        return invitation;
    }
}
