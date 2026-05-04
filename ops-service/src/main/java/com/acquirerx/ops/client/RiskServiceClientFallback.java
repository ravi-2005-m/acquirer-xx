package com.acquirerx.ops.client;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class RiskServiceClientFallback implements RiskServiceClient {

    @Override
    public Map<String, Object> getRiskSummary() {
        return Map.of("data", Map.of());
    }
}
