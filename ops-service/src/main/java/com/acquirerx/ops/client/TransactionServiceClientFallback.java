package com.acquirerx.ops.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class TransactionServiceClientFallback implements TransactionServiceClient {

    @Override
    public Map<String, Object> getTxnsByMerchant(Long merchantId, int page, int size) {
        log.error("FALLBACK: transaction-service unavailable");
        throw new IllegalStateException(
                "Transaction service unavailable. Cannot fetch transaction data.");
    }

    @Override
    public Map<String, Object> getTxnById(Long txnId) {
        log.error("FALLBACK: transaction-service unavailable. Cannot fetch txn: {}", txnId);
        throw new IllegalStateException(
                "Transaction service unavailable. Cannot verify transaction.");
    }

    @Override
    public Map<String, Object> getAllTxns() {
        log.error("FALLBACK: transaction-service unavailable. Cannot run reconciliation.");
        throw new IllegalStateException(
                "Transaction service unavailable. Cannot run reconciliation.");
    }
}