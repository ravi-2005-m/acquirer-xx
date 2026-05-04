package com.acquirerx.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cors-check")
public class CorsCheckController {

    @GetMapping
    public Map<String, String> check(
            @RequestHeader(value = "Origin", required = false) String origin) {
        return Map.of(
                "origin", origin != null ? origin : "(none)",
                "message", "CORS works — if you see this from a browser, you're good",
                "timestamp", LocalDateTime.now().toString()
        );
    }
}