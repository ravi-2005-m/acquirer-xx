package com.acquirerx.transaction.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class TerminalServiceClientFallback implements TerminalServiceClient {

    @Override
    public Map<String, Object> getTerminalById(Long terminalId) {
        log.error("FALLBACK: terminal-service unavailable. Cannot fetch terminal: {}", terminalId);
        throw new IllegalStateException(
                "Terminal service unavailable. Cannot process transaction.");
    }
}