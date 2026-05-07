package com.acquirerx.ops.reporting.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReportResponseDTO {

    private Long reportId;
    private String scope;
    private Long scopeRefId;
    private Integer totalTxnCount;
    private BigDecimal totalVolume;
    private BigDecimal totalFees;
    private BigDecimal totalNet;
    private Double chargebackRate;
    private Integer disputeCount;
    private Integer reconMismatchCount;
    private LocalDateTime generatedAt;
    private LocalDateTime periodFrom;
    private LocalDateTime periodTo;
}


