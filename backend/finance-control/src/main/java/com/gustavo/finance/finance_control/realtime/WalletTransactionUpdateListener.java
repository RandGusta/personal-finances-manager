package com.gustavo.finance.finance_control.realtime;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@Component
public class WalletTransactionUpdateListener {

    private final UserWalletRepository userWalletRepository;
    private final WalletEventService walletEventService;

    public WalletTransactionUpdateListener(
        UserWalletRepository userWalletRepository,
        WalletEventService walletEventService
    ) {
        this.userWalletRepository = userWalletRepository;
        this.walletEventService = walletEventService;
    }
    // Quando o service publica o evento, o Spring chama este método após o commit.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) // executado após o commit
    public void notifyWalletMembers(WalletTransactionChangedEvent event) { // evento de mudança da wallet
        List<UserWallet> memberships = userWalletRepository
            .findAllByWalletIdWithUser(event.getWalletId()); // pego os membros associados

        WalletUpdateResponse response = new WalletUpdateResponse(
            event.getWalletId(),
            event.getChangeType()
        );

        for (UserWallet membership : memberships) {
            walletEventService.sendToUser(
                membership.getUser().getId(), // enviamos apenas às conexões deste membro
                response // resposta do update
            );
        }
    }
}
