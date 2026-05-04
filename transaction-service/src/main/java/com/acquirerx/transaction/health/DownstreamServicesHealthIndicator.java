package com.acquirerx.transaction.health;

import com.netflix.discovery.EurekaClient;
import com.netflix.discovery.shared.Application;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Status;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DownstreamServicesHealthIndicator implements HealthIndicator {

    private final EurekaClient eurekaClient;

    private static final List<String> DOWNSTREAM = List.of(
        "MERCHANT-SERVICE", "TERMINAL-SERVICE", "RISK-SERVICE"
    );

    @Override
    public Health health() {
        Map<String, Object> details = new LinkedHashMap<>();
        boolean allUp = true;

        for (String service : DOWNSTREAM) {
            Application app = eurekaClient.getApplication(service);
            boolean up = app != null && !app.getInstances().isEmpty();
            details.put(service, up ? "UP" : "DOWN");
            if (!up) allUp = false;
        }

        return (allUp ? Health.up() : Health.status(new Status("DEGRADED")))
            .withDetails(details)
            .build();
    }
}
