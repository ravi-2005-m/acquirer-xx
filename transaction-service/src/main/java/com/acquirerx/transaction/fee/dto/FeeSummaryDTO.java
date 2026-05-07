package com.acquirerx.transaction.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class FeeSummaryDTO {

    private Long merchantId;
    private String merchantName;

    private Integer totalTxnCount;
    private Integer settledTxnCount;
    private Integer unsettledTxnCount;

    private BigDecimal totalGrossAmount;
    private BigDecimal totalSchemeFee;
    private BigDecimal totalInterchangeFee;
    private BigDecimal totalAcquirerMarkup;
    private BigDecimal totalFees;
    private BigDecimal totalNetAmount;
    private Double averageFeePercentage;
}
