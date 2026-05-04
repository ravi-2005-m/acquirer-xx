package com.acquirerx.ops.reporting.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsDashboardDTO {
    private long totalMerchants;
    private long activeMerchants;
    private long totalStores;
    private long totalTerminals;
    private long openDisputes;
    private long totalRiskEvents;
    private long riskEventsToday;
    private long totalSettlementBatches;
    private long pendingSettlements;
}
