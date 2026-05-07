package com.acquirerx.transaction.switchmodule.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionFilterDTO {

    private String status;
    private String txnType;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long merchantId;
    private Long terminalId;
    private String network;
}
