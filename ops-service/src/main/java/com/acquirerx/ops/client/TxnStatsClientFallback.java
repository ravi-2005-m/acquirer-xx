package com.acquirerx.ops.client;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TxnStatsClientFallback implements TxnStatsClient {

    @Override
    public Map<String, Object> getTxnStats() {
        return Map.of("data", Map.of());
    }
}
