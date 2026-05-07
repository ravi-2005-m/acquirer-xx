package com.acquirerx.risk.config.security;

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
                // /risk/check + /risk/summary — Feign internal, any authenticated
                .requestMatchers(HttpMethod.POST, "/risk/check").authenticated()
                .requestMatchers(HttpMethod.GET, "/risk/summary").authenticated()
                // All other risk endpoints — ADMIN or RISK
                .requestMatchers("/risk/**").hasAnyRole("ADMIN", "RISK")
                .anyRequest().authenticated()
            )
            .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
