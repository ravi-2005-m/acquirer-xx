package com.acquirerx.ops.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class MerchantServiceClientFallback implements MerchantServiceClient {

    @Override
    public Map<String, Object> getMerchantById(Long merchantId) {
        log.warn("FALLBACK: merchant-service unavailable. Using defaults");
        Map<String, Object> data = Map.of(
                "merchantId", merchantId,
                "legalName", "Unknown (merchant-service unavailable)");
        return Map.of("message", "Fallback", "data", data);
    }

    @Override
    public Map<String, Object> getMerchantStats() {
        log.warn("FALLBACK: merchant-service unavailable for stats");
        return Map.of("data", Map.of());
    }
}