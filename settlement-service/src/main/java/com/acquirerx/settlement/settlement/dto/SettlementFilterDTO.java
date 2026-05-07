package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SettlementFilterDTO {

    private String status;
    private Long merchantId;
    private BigDecimal minNetAmount;
    private BigDecimal maxNetAmount;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Integer minTxnCount;
}
