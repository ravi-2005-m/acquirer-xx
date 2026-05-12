package com.acquirerx.risk.risk.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RiskEventResponseDTO {

    private Long riskEventId;
    private Long txnId;
    private String pan;
    private BigDecimal txnAmount;
    private Long ruleId;
    private String ruleName;
    private Integer score;
    private String result;
    private LocalDateTime eventDate;
}
