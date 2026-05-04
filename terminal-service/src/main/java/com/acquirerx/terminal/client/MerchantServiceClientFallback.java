package com.acquirerx.terminal.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class MerchantServiceClientFallback implements MerchantServiceClient {

    @Override
    public Map<String, Object> getStoreById(Long storeId) {
        log.error("FALLBACK: merchant-service unavailable. Cannot verify store: {}", storeId);
        throw new IllegalStateException(
                "Merchant service unavailable. Cannot verify store exists.");
    }

    @Override
    public Map<String, Object> getMerchantById(Long merchantId) {
        log.error("FALLBACK: merchant-service unavailable. Cannot fetch merchant: {}", merchantId);
        throw new IllegalStateException(
                "Merchant service unavailable. Cannot fetch merchant details.");
    }
}