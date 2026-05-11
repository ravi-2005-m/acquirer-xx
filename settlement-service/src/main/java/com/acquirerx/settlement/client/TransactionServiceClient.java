package com.acquirerx.settlement.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Map;

@FeignClient(name = "TRANSACTION-SERVICE", path = "/api/v1", fallback = TransactionServiceClientFallback.class)
public interface TransactionServiceClient {

    @GetMapping("/txns/merchant/{merchantId}/unsettled")
    Map<String, Object> getUnsettledTxns(@PathVariable Long merchantId);

    @PutMapping("/txns/merchant/{merchantId}/mark-settled")
    Map<String, Object> markTxnsSettled(@PathVariable Long merchantId);

    @GetMapping("/transactions/batch/merchant/{merchantId}/has-open")
    Map<String, Object> hasOpenBatches(@PathVariable Long merchantId);
}
