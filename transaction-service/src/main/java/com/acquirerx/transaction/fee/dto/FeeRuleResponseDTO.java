package com.acquirerx.transaction.fee.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FeeRuleResponseDTO {

    private Long feeRuleId;
    private String cardType;
    private String transactionType;
    private BigDecimal schemePercentage;
    private BigDecimal interchangePercentage;
    private BigDecimal acquirerMarkupPercentage;

    private String mccPattern;
    private String region;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String network;
    private Integer priority;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;

    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
