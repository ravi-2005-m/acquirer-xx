package com.acquirerx.backend.fee.dto;

import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TxnFeeResponseDTO {
    private String txnId;
    private Double amount;
    private Double processingFee;
    private Double serviceFee;
    private Double gst;
    private Double totalFee;
    private Double netMerchantAmount;
    private TxnStatus status;
    private LocalDateTime txnDate;
}
