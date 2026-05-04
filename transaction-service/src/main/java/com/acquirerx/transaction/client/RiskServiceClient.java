package com.acquirerx.transaction.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "RISK-SERVICE", path = "/api/v1", fallback = RiskServiceClientFallback.class)
public interface RiskServiceClient {

    @PostMapping("/risk/check")
    Map<String, Object> checkRisk(
            @RequestParam Double amount,
            @RequestParam(required = false) String panMasked,
            @RequestParam(required = false) String tid);
}
