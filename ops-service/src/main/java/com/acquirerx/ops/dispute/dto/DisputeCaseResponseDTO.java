package com.acquirerx.ops.dispute.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DisputeCaseResponseDTO {

    private Long caseId;
    private String stage;
    private String status;
    private String reasonCode;
    private LocalDateTime openedDate;
    private LocalDateTime closedDate;
    private LocalDateTime deadline;
    private Long txnId;
    private BigDecimal txnAmount;
    private String merchantName;
    private String panMasked;
}


