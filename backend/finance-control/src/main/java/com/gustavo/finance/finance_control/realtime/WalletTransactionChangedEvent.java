package com.gustavo.finance.finance_control.realtime;

public class WalletTransactionChangedEvent {

    private final Long walletId;
    private final TransactionChangeType changeType;

    public WalletTransactionChangedEvent(Long walletId, TransactionChangeType changeType) {
        this.walletId = walletId;
        this.changeType = changeType;
    }

    public Long getWalletId() {
        return walletId;
    }

    public TransactionChangeType getChangeType() {
        return changeType;
    }
}
