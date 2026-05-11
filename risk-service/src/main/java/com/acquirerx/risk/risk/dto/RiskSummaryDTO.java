package com.acquirerx.risk.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class RiskSummaryDTO {

    // Today
    private Long eventsToday;
    private Long allowedToday;
    private Long reviewedToday;
    private Long blockedToday;
    private BigDecimal blockedAmountToday;

    // All-time
    private Long totalEvents;
    private Double allowRate;
    private Double reviewRate;
    private Double blockRate;

    // Configuration
    private Long activeRules;
    private Long inactiveRules;
    private Long blacklistEntries;
}
