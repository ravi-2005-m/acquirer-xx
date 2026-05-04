package com.acquirerx.risk.risk.dto;

import lombok.Data;

@Data
public class RiskRuleResponseDTO {

    private Long riskRuleId;
    private String name;
    private String expression;
    private Double maxAmount;
    private String severity;
    private String action;
    private Boolean active;
}
