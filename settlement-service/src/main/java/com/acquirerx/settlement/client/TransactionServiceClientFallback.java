package com.acquirerx.settlement.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class TransactionServiceClientFallback implements TransactionServiceClient {

    @Override
    public Map<String, Object> getUnsettledTxns(Long merchantId) {
        log.error("FALLBACK: transaction-service unavailable. Cannot get unsettled txns");
        throw new IllegalStateException(
                "Transaction service unavailable. Cannot process settlement.");
    }

    @Override
    public Map<String, Object> markTxnsSettled(Long merchantId) {
        log.error("FALLBACK: transaction-service unavailable. Cannot mark txns settled");
        throw new IllegalStateException(
                "Transaction service unavailable. Cannot mark transactions as settled.");
    }

    @Override
    public Map<String, Object> hasOpenBatches(Long merchantId) {
        log.warn("FALLBACK: transaction-service unavailable. Assuming no open batches for merchantId={}", merchantId);
        return java.util.Map.of("data", false);
    }
}