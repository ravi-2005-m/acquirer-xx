package com.acquirerx.gateway.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class BucketService {

    private final RateLimitProperties properties;
    private Cache<String, Bucket> cache;

    public BucketService(RateLimitProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    public void init() {
        cache = Caffeine.newBuilder()
                .expireAfterAccess(1, TimeUnit.HOURS)
                .maximumSize(100_000)
                .build();
    }

    public Bucket resolveBucket(String tierName, String clientId) {
        return cache.get(tierName + ":" + clientId, key -> newBucket(tierName));
    }

    private Bucket newBucket(String tierName) {
        RateLimitProperties.Tier tier = properties.getTiers().get(tierName);
        if (tier == null) {
            tier = properties.getTiers().get("standard");
        }

        Refill refill = Refill.intervally(tier.getRefillTokens(), Duration.ofSeconds(tier.getRefillPeriodSeconds()));
        Bandwidth limit = Bandwidth.classic(tier.getCapacity(), refill);
        return Bucket.builder().addLimit(limit).build();
    }
}
