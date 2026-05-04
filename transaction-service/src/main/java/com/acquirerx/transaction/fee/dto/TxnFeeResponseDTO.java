package com.acquirerx.transaction.fee.dto;

import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TxnFeeResponseDTO {
    private Long txnId;
    private Double amount;
    private Double schemeFee;
    private Double interchangeFee;
    private Double acquirerMarkup;
    private Double totalFee;
    private Double netMerchantAmount;
    private TxnStatus status;
    private LocalDateTime txnDate;
}
