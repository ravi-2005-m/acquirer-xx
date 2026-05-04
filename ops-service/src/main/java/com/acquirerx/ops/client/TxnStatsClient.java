package com.acquirerx.ops.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "TRANSACTION-SERVICE", contextId = "txnStatsClient", path = "/api/v1", fallback = TxnStatsClientFallback.class)
public interface TxnStatsClient {

    @GetMapping("/txns/stats")
    Map<String, Object> getTxnStats();
}
