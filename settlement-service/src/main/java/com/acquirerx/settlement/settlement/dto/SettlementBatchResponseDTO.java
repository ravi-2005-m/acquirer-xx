package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SettlementBatchResponseDTO {

    private Long settleBatchId;
    private Long merchantId;
    private String merchantName;
    private BigDecimal grossAmount;
    private BigDecimal totalFees;
    private BigDecimal schemeFees;
    private BigDecimal interchangeFees;
    private BigDecimal acquirerMarkups;
    private BigDecimal adjustmentTotal;
    private BigDecimal netAmount;
    private Integer txnCount;
    private String txnSummary;
    private String status;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private LocalDateTime postedDate;
}
