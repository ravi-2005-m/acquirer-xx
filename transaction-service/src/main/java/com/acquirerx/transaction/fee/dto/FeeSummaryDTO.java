package com.acquirerx.transaction.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeeSummaryDTO {

    private Long merchantId;
    private String merchantName;

    private Integer totalTxnCount;
    private Integer settledTxnCount;
    private Integer unsettledTxnCount;

    private Double totalGrossAmount;
    private Double totalSchemeFee;
    private Double totalInterchangeFee;
    private Double totalAcquirerMarkup;
    private Double totalFees;
    private Double totalNetAmount;
    private Double averageFeePercentage;
}
