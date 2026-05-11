package com.acquirerx.risk.risk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RiskRuleRequestDTO {

    @NotBlank(message = "Rule name is required")
    @Size(min = 3, max = 100, message = "Rule name must be 3-100 characters")
    private String name;

    @NotBlank(message = "Condition type is required")
    private String conditionType;

    private BigDecimal threshold;

    @NotBlank(message = "Action is required")
    @Pattern(regexp = "^(ALLOW|REVIEW|BLOCK)$",
            message = "Action must be ALLOW, REVIEW, or BLOCK")
    private String action;

    private Integer priority;

    private String description;
}
