package com.acquirerx.ops.reconciliation.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReconItemResponseDTO {

    private Long reconItemId;
    private String reference;
    private BigDecimal amount;
    private String matchStatus;
    private String notes;
    private Long reconFileId;
}


