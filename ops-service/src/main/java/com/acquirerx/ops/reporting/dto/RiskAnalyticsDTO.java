package com.acquirerx.ops.reporting.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskAnalyticsDTO {
    private long totalRiskEvents;
    private long totalBlocked;
    private long totalReviewed;
    private long totalAllowed;
    private long todayRiskEvents;
    private long todayBlocked;
    private long activePanBlacklist;
    private long activeTerminalBlacklist;
    private long activeMerchantBlacklist;
    private long activeRules;
    private double blockRate;
}
