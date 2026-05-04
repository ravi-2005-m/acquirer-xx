package com.acquirerx.backend.fee.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class FeeRuleResponseDTO {

    private Long feeRuleId;
    private String ruleType;
    private String description;
    private Double ratePct;
    private Double flatFee;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean active;
}
