package com.acquirerx.settlement.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SettlementStatsDTO {
    private long totalBatches;
    private long readyBatches;
    private long paidBatches;
    private long onHoldBatches;
    private double totalGrossAmount;
    private double totalNetAmount;
    private double totalFees;
}
