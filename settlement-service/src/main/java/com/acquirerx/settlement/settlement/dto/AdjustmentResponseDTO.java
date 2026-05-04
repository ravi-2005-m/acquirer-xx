package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdjustmentResponseDTO {

    private Long adjustmentId;
    private Long merchantId;
    private Long txnId;
    private Double amount;
    private String reason;
    private String type;
    private String status;
    private LocalDateTime postedDate;
}
