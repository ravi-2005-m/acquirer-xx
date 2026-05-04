package com.acquirerx.backend.risk.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RiskEventResponseDTO {

    private Long riskEventId;
    private String txnId;
    private Double txnAmount;
    private Long ruleId;
    private String ruleName;
    private Integer score;
    private String result;
    private LocalDateTime eventDate;
}
