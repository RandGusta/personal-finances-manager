package com.gustavo.finance.finance_control.realtime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.gustavo.finance.finance_control.entity.User;
import com.gustavo.finance.finance_control.entity.UserWallet;
import com.gustavo.finance.finance_control.repository.UserWalletRepository;

@ExtendWith(MockitoExtension.class)
class WalletTransactionUpdateListenerTest {

    @Mock
    private UserWalletRepository userWalletRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Test
    void shouldNotifyEachWalletMemberAfterTransactionChange() {
        User user = new User();
        user.setEmail("member@example.com");
        UserWallet membership = new UserWallet();
        membership.setUser(user);

        when(userWalletRepository.findAllByWalletIdWithUser(20L))
            .thenReturn(List.of(membership));

        WalletTransactionUpdateListener listener = new WalletTransactionUpdateListener(
            userWalletRepository,
            messagingTemplate
        );

        listener.notifyWalletMembers(new WalletTransactionChangedEvent(
            20L,
            TransactionChangeType.CREATED
        ));

        org.mockito.ArgumentCaptor<WalletUpdateResponse> responseCaptor =
            org.mockito.ArgumentCaptor.forClass(WalletUpdateResponse.class);
        verify(messagingTemplate).convertAndSendToUser(
            eq("member@example.com"),
            eq("/queue/wallet-updates"),
            responseCaptor.capture()
        );
        assertEquals(20L, responseCaptor.getValue().getWalletId());
        assertEquals(TransactionChangeType.CREATED, responseCaptor.getValue().getChangeType());
    }
}
