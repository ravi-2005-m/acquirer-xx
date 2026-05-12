package com.acquirerx.risk.risk.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RiskEventFilterDTO {

    private String result;
    private String pan;
    private Integer minScore;
    private Integer maxScore;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long txnId;
    private Long ruleId;
}
