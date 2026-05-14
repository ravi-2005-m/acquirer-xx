package com.acquirerx.risk.risk.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RiskRuleResponseDTO {

    private Long ruleId;
    private String name;
    private String conditionType;
    private BigDecimal threshold;
    private String action;
    private Boolean active;
    private Integer priority;
    private String description;
    private LocalDateTime createdAt;
}
