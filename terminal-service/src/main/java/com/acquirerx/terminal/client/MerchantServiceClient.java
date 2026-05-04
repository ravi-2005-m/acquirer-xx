package com.acquirerx.terminal.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "MERCHANT-SERVICE", path = "/api/v1", fallback = MerchantServiceClientFallback.class)
public interface MerchantServiceClient {

    // Call merchant-service to verify store exists
    @GetMapping("/stores/{storeId}")
    Map<String, Object> getStoreById(@PathVariable Long storeId);

    // Call merchant-service to get merchant details
    @GetMapping("/merchants/{merchantId}")
    Map<String, Object> getMerchantById(@PathVariable Long merchantId);
}
