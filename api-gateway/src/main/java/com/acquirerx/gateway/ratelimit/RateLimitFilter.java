package com.acquirerx.gateway.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final BucketService bucketService;
    private final TierResolver tierResolver;
    private final ClientIdentifier clientIdentifier;
    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(BucketService bucketService,
                           TierResolver tierResolver,
                           ClientIdentifier clientIdentifier,
                           RateLimitProperties properties,
                           ObjectMapper objectMapper) {
        this.bucketService = bucketService;
        this.tierResolver = tierResolver;
        this.clientIdentifier = clientIdentifier;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!properties.isEnabled()) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String tier = tierResolver.resolveTier(request.getURI().getPath());
        String clientId = clientIdentifier.resolve(request);

        Bucket bucket = bucketService.resolveBucket(tier, clientId);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            ServerHttpResponse response = exchange.getResponse();
            response.getHeaders().add("X-RateLimit-Limit", String.valueOf(properties.getTiers().get(tier).getCapacity()));
            response.getHeaders().add("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            response.getHeaders().add("X-RateLimit-Tier", tier);
            return chain.filter(exchange);
        }

        long retryAfter = probe.getNanosToWaitForRefill() <= 0 ? 1 : java.util.concurrent.TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
        return tooManyRequests(exchange, tier, retryAfter);
    }

    private Mono<Void> tooManyRequests(ServerWebExchange exchange, String tier, long retryAfterSeconds) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("Content-Type", MediaType.APPLICATION_JSON_VALUE);
        response.getHeaders().add("Retry-After", String.valueOf(retryAfterSeconds));
        response.getHeaders().add("X-RateLimit-Tier", tier);
        response.getHeaders().add("X-RateLimit-Remaining", "0");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 429);
        body.put("error", "TOO_MANY_REQUESTS");
        body.put("errorCode", "RATE_LIMIT_EXCEEDED");
        body.put("message", "Too many requests. Please retry after " + retryAfterSeconds + " seconds.");
        body.put("path", exchange.getRequest().getURI().getPath());
        body.put("retryAfterSeconds", retryAfterSeconds);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(body);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            log.error("Failed to serialize rate limit response", e);
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
