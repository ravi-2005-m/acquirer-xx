package com.acquirerx.backend.risk.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RiskEventFilterDTO {

    private String result;
    private Integer minScore;
    private Integer maxScore;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long txnId;
    private Long ruleId;
}
