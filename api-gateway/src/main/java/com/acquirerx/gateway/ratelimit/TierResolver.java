package com.acquirerx.gateway.ratelimit;

import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;

@Component
public class TierResolver {

    private final RateLimitProperties properties;
    private final PathMatcher matcher = new AntPathMatcher();

    public TierResolver(RateLimitProperties properties) {
        this.properties = properties;
    }

    public String resolveTier(String path) {
        if (properties.getPaths() == null) {
            return "standard";
        }

        return properties.getPaths().stream()
                .filter(mapping -> matcher.match(mapping.getPattern(), path))
                .findFirst()
                .map(RateLimitProperties.PathMapping::getTier)
                .orElse("standard");
    }
}
