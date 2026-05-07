package com.acquirerx.settlement.settlement.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PayoutResponseDTO {

    private Long payoutId;
    private Long settleBatchId;
    private Long merchantId;
    private String merchantName;
    private BigDecimal amount;
    private String bankAccountRef;
    private String status;
    private LocalDateTime payoutDate;
}
