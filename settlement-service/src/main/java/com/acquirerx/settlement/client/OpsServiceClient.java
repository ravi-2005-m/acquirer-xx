package com.acquirerx.settlement.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "OPS-SERVICE", path = "/api/v1", fallback = OpsServiceClientFallback.class)
public interface OpsServiceClient {

    @PostMapping("/notifications/send")
    void sendNotification(@RequestParam Long userId,
                          @RequestParam String message,
                          @RequestParam String category);
}
