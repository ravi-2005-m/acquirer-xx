package com.acquirerx.settlement.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SettlementStatsDTO {
    private long totalBatches;
    private long readyBatches;
    private long paidBatches;
    private long onHoldBatches;
    private BigDecimal totalGrossAmount;
    private BigDecimal totalNetAmount;
    private BigDecimal totalFees;
}
