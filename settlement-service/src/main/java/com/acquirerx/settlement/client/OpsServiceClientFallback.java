package com.acquirerx.settlement.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OpsServiceClientFallback implements OpsServiceClient {

    @Override
    public void sendNotification(Long userId, String message, String category) {
        log.warn("Could not send notification to ops-service: userId={}, category={}", userId, category);
    }
}
