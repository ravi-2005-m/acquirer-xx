package com.acquirerx.backend.switchmodule.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionFilterDTO {

    private String status;
    private String txnType;
    private Double minAmount;
    private Double maxAmount;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long merchantId;
    private Long terminalId;
    private String network;
}
