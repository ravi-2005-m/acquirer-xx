package com.acquirerx.ops.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "RISK-SERVICE", path = "/api/v1", fallback = RiskServiceClientFallback.class)
public interface RiskServiceClient {

    @GetMapping("/risk/summary")
    Map<String, Object> getRiskSummary();
}
