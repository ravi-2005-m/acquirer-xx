package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SettlementBatchResponseDTO {

    private Long settleBatchId;
    private Long merchantId;
    private String merchantName;
    private Double grossAmount;
    private Double totalFees;
    private Double netAmount;
    private Integer txnCount;
    private String status;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private LocalDateTime postedDate;
}
