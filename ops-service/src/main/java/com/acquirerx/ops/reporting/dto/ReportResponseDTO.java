package com.acquirerx.ops.reporting.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportResponseDTO {

    private Long reportId;
    private String scope;
    private Long scopeRefId;
    private Integer totalTxnCount;
    private Double totalVolume;
    private Double totalFees;
    private Double totalNet;
    private Double chargebackRate;
    private Integer disputeCount;
    private Integer reconMismatchCount;
    private LocalDateTime generatedAt;
    private LocalDateTime periodFrom;
    private LocalDateTime periodTo;
}


