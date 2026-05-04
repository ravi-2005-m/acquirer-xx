package com.acquirerx.ops.client;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SettlementStatsClientFallback implements SettlementStatsClient {

    @Override
    public Map<String, Object> getSettlementStats() {
        return Map.of("data", Map.of());
    }
}
