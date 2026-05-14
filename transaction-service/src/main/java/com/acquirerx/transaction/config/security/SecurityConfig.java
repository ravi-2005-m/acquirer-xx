package com.acquirerx.transaction.config.security;

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
                // Fee rules — admin only
                .requestMatchers("/fee-rules", "/fee-rules/**")
                    .hasRole("ADMIN")
                // Batch open/close — ADMIN only
                .requestMatchers(HttpMethod.POST, "/transactions/batch/*/open", "/transactions/batch/*/close")
                    .hasRole("ADMIN")
                // Authorize / void / refund — MERCHANT_OPS
                .requestMatchers(HttpMethod.POST, "/transactions/authorize", "/transactions/void", "/transactions/refund")
                    .hasAnyRole("ADMIN", "MERCHANT_OPS")
                // Read transactions
                .requestMatchers(HttpMethod.GET, "/transactions", "/transactions/**")
                    .hasAnyRole("ADMIN", "MERCHANT_OPS", "RISK")
                .requestMatchers(HttpMethod.POST, "/transactions/search", "/transactions/stats")
                    .hasAnyRole("ADMIN", "MERCHANT_OPS", "RISK")
                // /txns/* — Feign internal endpoints; require any authenticated user
                .requestMatchers("/txns/**", "/merchants/*/fee-summary").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
