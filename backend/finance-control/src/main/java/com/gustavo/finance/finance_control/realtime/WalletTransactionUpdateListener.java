package com.gustavo.finance.finance_control.realtime;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@Component
public class WalletTransactionUpdateListener {

    private final UserWalletRepository userWalletRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public WalletTransactionUpdateListener(
        UserWalletRepository userWalletRepository,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.userWalletRepository = userWalletRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void notifyWalletMembers(WalletTransactionChangedEvent event) {
        List<UserWallet> memberships = userWalletRepository
            .findAllByWalletIdWithUser(event.getWalletId());

        WalletUpdateResponse response = new WalletUpdateResponse(
            event.getWalletId(),
            event.getChangeType()
        );

        for (UserWallet membership : memberships) {
            messagingTemplate.convertAndSendToUser(
                membership.getUser().getEmail(),
                "/queue/wallet-updates",
                response
            );
        }
    }
}
