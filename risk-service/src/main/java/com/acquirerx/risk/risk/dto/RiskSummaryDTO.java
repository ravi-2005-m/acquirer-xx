package com.acquirerx.risk.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RiskSummaryDTO {

    private Long totalRiskEvents;
    private Long totalBlocked;
    private Long totalReviewed;
    private Long totalAllowed;

    private Long todayRiskEvents;
    private Long todayBlocked;
    private Long todayReviewed;

    private Long activePanBlacklist;
    private Long activeTerminalBlacklist;
    private Long activeMerchantBlacklist;

    private Long activeRules;
    private Long blockRules;
    private Long reviewRules;

    private Double blockRate;
}
