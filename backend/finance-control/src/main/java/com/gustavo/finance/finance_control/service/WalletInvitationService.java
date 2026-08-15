package com.gustavo.finance.finance_control.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import com.gustavo.finance.finance_control.exception.ConflictException;
import com.gustavo.finance.finance_control.exception.ResourceNotFoundException;
import com.gustavo.finance.finance_control.repository.UserRepository;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;
import com.gustavo.finance.finance_control.repository.WalletInvitationRepository;

@Service
public class WalletInvitationService {

    private static final int EXPIRATION_DAYS = 7;

    private final WalletInvitationRepository invitationRepository;
    private final UserWalletRepository userWalletRepository;
    private final UserRepository userRepository;
    private final EmailSenderService emailSenderService;
    private final String frontendUrl;

    public WalletInvitationService(
        WalletInvitationRepository invitationRepository,
        UserWalletRepository userWalletRepository,
        UserRepository userRepository,
        EmailSenderService emailSenderService,
        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.invitationRepository = invitationRepository;
        this.userWalletRepository = userWalletRepository;
        this.userRepository = userRepository;
        this.emailSenderService = emailSenderService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public MessageResponse invite(
        User requester,
        Long walletId,
        WalletInvitationRequest request
    ) {
        UserWallet ownerMembership = findOwnerMembership(requester, walletId);
        validateRole(request.getRole());

        String email = request.getEmail().trim().toLowerCase();
        

        validateUserIsNotAlreadyMember(walletId, email);
        // validateNoActiveInvitation(walletId, email);

        WalletInvitation invitation = new WalletInvitation();
        invitation.setWallet(ownerMembership.getWallet());
        invitation.setInvitedBy(requester);
        invitation.setEmail(email);
        invitation.setRole(request.getRole());
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS));
        invitation.setAccepted(false);

        WalletInvitation savedInvitation = invitationRepository.save(invitation);
        sendInvitationEmail(savedInvitation);

        return new MessageResponse("Wallet invitation sent successfully.");
    }

    @Transactional
    public WalletMemberResponse accept(User user, String token) {
        WalletInvitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new BusinessException("Wallet invitation is invalid"));

        if (invitation.isAccepted()) {
            throw new BusinessException("Wallet invitation has already been accepted");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Wallet invitation has expired");
        }

        if (!invitation.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new AccessDeniedException(
                "This invitation was sent to a different e-mail address"
            );
        }

        Long walletId = invitation.getWallet().getId();
        if (userWalletRepository.existsByWalletIdAndUser(walletId, user)) {
            throw new ConflictException("User is already a wallet member");
        }

        UserWallet membership = new UserWallet();
        membership.setWallet(invitation.getWallet());
        membership.setUser(user);
        membership.setUserRelationWallet(invitation.getRole());
        membership.setAssociationDate(LocalDateTime.now());
        UserWallet savedMembership = userWalletRepository.save(membership);

        invitation.setAccepted(true);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        return WalletMemberResponse.from(savedMembership);
    }

    private void validateRole(UserRelationWallet role) {
        if (role == null || role == UserRelationWallet.OWNER) {
            throw new BusinessException("Invitation role must be EDITOR or VIEWER");
        }
    }

    private void validateUserIsNotAlreadyMember(Long walletId, String email) {
        Optional<User> invitedUser = userRepository.findByEmailIgnoreCase(email);

        if (invitedUser.isPresent()) {
            boolean alreadyMember = userWalletRepository.existsByWalletIdAndUser(
                walletId,
                invitedUser.get()
            );

            if (alreadyMember) {
                throw new ConflictException("User is already a wallet member");
            }
        }
    }

    // private void validateNoActiveInvitation(Long walletId, String email) {
    //     Optional<WalletInvitation> existingInvitation = invitationRepository
    //         .findFirstByWalletIdAndEmailIgnoreCaseAndAcceptedFalseOrderByCreatedAtDesc(
    //             walletId,
    //             email
    //         );

    //     if (existingInvitation.isPresent()) {
    //         WalletInvitation invitation = existingInvitation.get();

    //         if (invitation.getExpiresAt().isAfter(LocalDateTime.now())) {
    //             throw new ConflictException("An active invitation already exists for this e-mail");
    //         }
    //     }
    // }

    private UserWallet findOwnerMembership(User user, Long walletId) {
        UserWallet membership = userWalletRepository.findByWalletIdAndUser(walletId, user)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (membership.getUserRelationWallet() != UserRelationWallet.OWNER) {
            throw new AccessDeniedException("Only the wallet owner can invite members");
        }

        return membership;
    }

    private void sendInvitationEmail(WalletInvitation invitation) {
        String invitationLink = buildInvitationLink(invitation.getToken());
        Context context = new Context();
        context.setVariable("inviterName", invitation.getInvitedBy().getUsername());
        context.setVariable("walletName", invitation.getWallet().getName());
        context.setVariable("role", invitation.getRole().name());
        context.setVariable("invitationLink", invitationLink);
        context.setVariable("token", invitation.getToken());
        context.setVariable("expirationDays", EXPIRATION_DAYS);

        emailSenderService.sendEmailTemplate(
            invitation.getEmail(),
            "Wallet invitation",
            "walletInvitation",
            context
        );
    }

    private String buildInvitationLink(String token) {
        String baseUrl = frontendUrl;

        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        return baseUrl + "/wallet-invitations/" + token;
    }
}
