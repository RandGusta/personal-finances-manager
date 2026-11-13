package com.gustavo.finance.finance_control.realtime;

public class WalletUpdateResponse {

    private final Long walletId;
    private final TransactionChangeType changeType;

    public WalletUpdateResponse(Long walletId, TransactionChangeType changeType) {
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
