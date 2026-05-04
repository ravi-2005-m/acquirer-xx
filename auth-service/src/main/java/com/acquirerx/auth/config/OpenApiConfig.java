package com.acquirerx.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AcquirerX Auth Service API")
                        .version("1.0.0")
                        .description(
                                "Identity and Access Management Service.\n\n" +
                                        "**Features:** User Registration, Login (JWT), Token Validation, " +
                                        "User Management (Admin), Audit Logging, RBAC.\n\n" +
                                        "**Auth:** Register → Login → Copy token → " +
                                        "Click Authorize → Paste token → All protected endpoints work.")
                        .contact(new Contact()
                                .name("Kailash")
                                .email("kailash@acquirerx.com")))
                .addServersItem(new Server()
                        .url("/api/v1")
                        .description("Auth Service API v1"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste your JWT token here (without 'Bearer ' prefix)")))
                .addSecurityItem(new SecurityRequirement()
                        .addList("bearerAuth"))
                .tags(List.of(
                        new Tag().name("1. Auth & IAM")
                                .description("Register, Login, User Management, Audit Logs")
                ));
    }
}
