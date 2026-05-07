package com.acquirerx.transaction.fee.dto;

import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TxnFeeResponseDTO {
    private Long txnId;
    private BigDecimal amount;
    private BigDecimal schemeFee;
    private BigDecimal interchangeFee;
    private BigDecimal acquirerMarkup;
    private BigDecimal totalFee;
    private BigDecimal netMerchantAmount;
    private TxnStatus status;
    private LocalDateTime txnDate;
}
