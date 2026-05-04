package com.acquirerx.ops.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "MERCHANT-SERVICE", path = "/api/v1", fallback = MerchantServiceClientFallback.class)
public interface MerchantServiceClient {

    @GetMapping("/merchants/{merchantId}")
    Map<String, Object> getMerchantById(@PathVariable Long merchantId);

    @GetMapping("/merchants/stats")
    Map<String, Object> getMerchantStats();
}
