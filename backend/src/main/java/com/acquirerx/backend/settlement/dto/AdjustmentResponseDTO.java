package com.acquirerx.backend.settlement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdjustmentResponseDTO {

    private Long adjustmentId;
    private Long merchantId;
    private String merchantName;
    private Double amount;
    private String reason;
    private String notes;
    private String status;
    private LocalDateTime postedDate;
}
