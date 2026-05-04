package com.acquirerx.merchant.merchant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MerchantStatsDTO {

    private Long totalMerchants;
    private Long activeMerchants;
    private Long inactiveMerchants;
    private Long pendingMerchants;

    private Long lowRiskCount;
    private Long mediumRiskCount;
    private Long highRiskCount;
    private Long criticalRiskCount;

    private Long totalStores;
    private Long totalTerminals;
}
