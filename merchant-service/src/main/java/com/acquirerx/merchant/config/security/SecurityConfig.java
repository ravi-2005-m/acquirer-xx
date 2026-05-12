package com.acquirerx.merchant.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final HeaderAuthFilter headerAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/actuator/health/**",
                    "/actuator/info",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                // Feign-called read endpoints (service-to-service, any authenticated role)
                .requestMatchers(HttpMethod.GET, "/merchants/{merchantId:\\d+}").authenticated()
                .requestMatchers(HttpMethod.GET, "/merchants/stats").authenticated()
                .requestMatchers(HttpMethod.GET, "/merchants/status/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/stores/{storeId:\\d+}").authenticated()
                // User-facing merchant + store + onboarding endpoints
                .requestMatchers("/merchants/**", "/stores/**")
                    .hasAnyRole("ADMIN", "MERCHANT_OPS", "POS_OPS", "RECON")
                .anyRequest().authenticated()
            )
            .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
