package com.acquirerx.ops.reconciliation.dto;

import lombok.Data;

@Data
public class ReconItemResponseDTO {

    private Long reconItemId;
    private String reference;
    private Double amount;
    private String matchStatus;
    private String notes;
    private Long reconFileId;
}


