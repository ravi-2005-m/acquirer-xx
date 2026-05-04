package com.acquirerx.settlement.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class MerchantServiceClientFallback implements MerchantServiceClient {

    @Override
    public Map<String, Object> getMerchantById(Long merchantId) {
        log.warn("FALLBACK: merchant-service unavailable. Using defaults for merchant: {}", merchantId);
        Map<String, Object> data = Map.of(
                "merchantId", merchantId,
                "legalName", "Unknown (merchant-service unavailable)");
        return Map.of("message", "Fallback", "data", data);
    }

    @Override
    public Map<String, Object> getActiveMerchants(int page, int size) {
        log.error("FALLBACK: merchant-service unavailable. Cannot run EOD settlement.");
        throw new IllegalStateException(
                "Merchant service unavailable. Cannot run EOD settlement.");
    }
}