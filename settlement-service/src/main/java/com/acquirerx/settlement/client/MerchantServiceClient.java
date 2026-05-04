package com.acquirerx.settlement.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "MERCHANT-SERVICE", path = "/api/v1", fallback = MerchantServiceClientFallback.class)
public interface MerchantServiceClient {

    @GetMapping("/merchants/{merchantId}")
    Map<String, Object> getMerchantById(@PathVariable Long merchantId);

    @GetMapping("/merchants/status/ACTIVE")
    Map<String, Object> getActiveMerchants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size);
}
