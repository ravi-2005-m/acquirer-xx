package com.acquirerx.transaction.fee.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TxnFilterDTO {

    private String status;
    private Boolean settled;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long merchantId;
    private Long terminalId;
    private String currency;
}
