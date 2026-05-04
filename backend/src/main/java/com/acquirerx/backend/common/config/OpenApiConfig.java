package com.acquirerx.backend.common.config;

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
                        .title("AcquirerX API")
                        .version("1.0.0")
                        .description(
                                "Merchant Acquiring & POS Switch System.\n\n" +
                                        "**Modules:** Merchant Onboarding, Terminal Management, " +
                                        "Transaction Authorization, Fee Engine, Settlement, " +
                                        "Risk & Fraud, Disputes, Reconciliation, Reporting, " +
                                        "Notifications, IAM (JWT + RBAC).\n\n" +
                                        "**Auth:** Register → Login → Copy token → " +
                                        "Click Authorize → Paste token → All endpoints work.")
                        .contact(new Contact()
                                .name("Kailash")
                                .email("kailash@acquirerx.com")))
                .addServersItem(new Server()
                        .url("/api/v1")
                        .description("AcquirerX API v1"))
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
                                .description("Register, Login, User Management, Audit Logs"),
                        new Tag().name("2. Merchants")
                                .description("Merchant onboarding, status, search, stats"),
                        new Tag().name("3. Stores")
                                .description("Store management under merchants"),
                        new Tag().name("4. Terminals")
                                .description("Terminal provisioning under stores"),
                        new Tag().name("5. Transactions")
                                .description("Batch open/close, authorize, void, refund, search"),
                        new Tag().name("6. Fee Engine")
                                .description("Fee rules, transaction clearing, fee summary"),
                        new Tag().name("7. Settlement")
                                .description("Settlement batches, payouts, adjustments, summary"),
                        new Tag().name("8. Risk & Fraud")
                                .description("Risk rules, blacklist, risk events, risk summary"),
                        new Tag().name("9. Disputes")
                                .description("Dispute lifecycle: retrieval → chargeback → representment → arbitration"),
                        new Tag().name("10. Reconciliation")
                                .description("Recon file loading, matching, exceptions, summary"),
                        new Tag().name("11. Reporting")
                                .description("Merchant + network reports, stats"),
                        new Tag().name("12. Notifications")
                                .description("In-app notifications, unread count, stats"),
                        new Tag().name("13. Health")
                                .description("Hello endpoint for basic health check")
                ));
    }
}