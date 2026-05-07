package com.acquirerx.settlement.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SettlementSummaryDTO {

    private Long merchantId;
    private String merchantName;

    private Integer totalBatchCount;
    private Integer paidBatchCount;
    private Integer readyBatchCount;
    private Integer onHoldBatchCount;

    private BigDecimal totalGrossAmount;
    private BigDecimal totalFeesDeducted;
    private BigDecimal totalNetPaid;
    private BigDecimal totalAdjustments;

    private BigDecimal pendingPayoutAmount;
}
