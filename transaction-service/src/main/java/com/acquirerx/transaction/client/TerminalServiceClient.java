package com.acquirerx.transaction.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "TERMINAL-SERVICE", path = "/api/v1", fallback = TerminalServiceClientFallback.class)
public interface TerminalServiceClient {

    @GetMapping("/terminals/{terminalId}")
    Map<String, Object> getTerminalById(@PathVariable Long terminalId);
}
