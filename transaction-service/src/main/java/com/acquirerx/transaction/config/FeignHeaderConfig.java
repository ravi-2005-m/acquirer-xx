package com.acquirerx.transaction.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignHeaderConfig {

    /**
     * Forwards X-User-Id from the incoming HTTP request to every outgoing
     * Feign call so downstream services (risk-service, etc.) can attribute
     * actions to the authenticated user — e.g. sending a BLOCK notification.
     */
    @Bean
    public RequestInterceptor userIdForwardingInterceptor() {
        return template -> {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                String userId = servletAttrs.getRequest().getHeader("X-User-Id");
                if (userId != null && !userId.isBlank()) {
                    template.header("X-User-Id", userId);
                }
            }
        };
    }
}
