package com.acquirerx.backend.fee.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TxnFilterDTO {

    private String status;
    private Boolean settled;
    private Double minAmount;
    private Double maxAmount;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long merchantId;
    private Long terminalId;
    private String currency;
}
