package com.acquirerx.ops.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "TRANSACTION-SERVICE", contextId = "transactionServiceClient", path = "/api/v1", fallback = TransactionServiceClientFallback.class)
public interface TransactionServiceClient {

    @GetMapping("/txns/merchant/{merchantId}")
    Map<String, Object> getTxnsByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size);

    @GetMapping("/txns/{txnId}")
    Map<String, Object> getTxnById(@PathVariable Long txnId);

    @GetMapping("/txns/all")
    Map<String, Object> getAllTxns();
}
