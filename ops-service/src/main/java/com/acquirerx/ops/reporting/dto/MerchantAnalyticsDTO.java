package com.acquirerx.ops.reporting.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MerchantAnalyticsDTO {
    private long totalMerchants;
    private long activeMerchants;
    private long inactiveMerchants;
    private long pendingMerchants;
    private long lowRiskCount;
    private long mediumRiskCount;
    private long highRiskCount;
    private long criticalRiskCount;
    private long totalStores;
    private long totalTerminals;
}
