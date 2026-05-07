package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdjustmentResponseDTO {

    private Long adjustmentId;
    private Long merchantId;
    private Long txnId;
    private BigDecimal amount;
    private String reason;
    private String type;
    private String status;
    private LocalDateTime postedDate;
}
