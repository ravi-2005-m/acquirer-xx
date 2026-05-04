package com.acquirerx.transaction.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class RiskServiceClientFallback implements RiskServiceClient {

    @Override
    public Map<String, Object> checkRisk(Double amount, String panMasked, String tid) {
        log.warn("FALLBACK: risk-service unavailable. Defaulting to ALLOW for amount={}", amount);

        Map<String, Object> data = new HashMap<>();
        data.put("result", "ALLOW");
        data.put("score", 0);
        data.put("reason", "Risk service unavailable — default ALLOW");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Fallback response");
        response.put("data", data);
        return response;
    }
}
