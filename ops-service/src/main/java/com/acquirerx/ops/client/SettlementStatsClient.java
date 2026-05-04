package com.acquirerx.ops.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "SETTLEMENT-SERVICE", path = "/api/v1", fallback = SettlementStatsClientFallback.class)
public interface SettlementStatsClient {

    @GetMapping("/settlement/stats")
    Map<String, Object> getSettlementStats();
}
