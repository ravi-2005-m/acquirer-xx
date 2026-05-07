package com.acquirerx.risk.risk.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RiskRuleResponseDTO {

    private Long riskRuleId;
    private String name;
    private String expression;
    private BigDecimal maxAmount;
    private String severity;
    private String action;
    private Boolean active;
}
