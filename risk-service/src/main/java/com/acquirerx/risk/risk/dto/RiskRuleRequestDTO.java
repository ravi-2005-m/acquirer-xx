package com.acquirerx.risk.risk.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RiskRuleRequestDTO {

    @NotBlank(message = "Rule name is required")
    @Size(min = 3, max = 100, message = "Rule name must be 3-100 characters")
    private String name;

    private String expression;

    @NotNull(message = "Max amount is required")
    @Min(value = 1, message = "Max amount must be at least 1")
    private Double maxAmount;

    @NotBlank(message = "Severity is required")
    @Pattern(regexp = "^(LOW|MEDIUM|HIGH|CRITICAL)$",
            message = "Severity must be LOW, MEDIUM, HIGH, or CRITICAL")
    private String severity;

    @NotBlank(message = "Action is required")
    @Pattern(regexp = "^(ALLOW|REVIEW|BLOCK)$",
            message = "Action must be ALLOW, REVIEW, or BLOCK")
    private String action;
}
