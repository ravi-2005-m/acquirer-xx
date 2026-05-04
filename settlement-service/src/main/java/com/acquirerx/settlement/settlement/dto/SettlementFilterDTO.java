package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SettlementFilterDTO {

    private String status;
    private Long merchantId;
    private Double minNetAmount;
    private Double maxNetAmount;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Integer minTxnCount;
}
