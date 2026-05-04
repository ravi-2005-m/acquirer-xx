package com.acquirerx.ops.reporting.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SettleAnalyticsDTO {
    private long totalBatches;
    private long readyBatches;
    private long paidBatches;
    private long onHoldBatches;
    private double totalGrossAmount;
    private double totalNetAmount;
    private double totalFees;
}
