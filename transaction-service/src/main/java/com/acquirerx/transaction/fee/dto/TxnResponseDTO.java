package com.acquirerx.transaction.fee.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TxnResponseDTO {

    private Long txnId;
    private BigDecimal amount;
    private String currency;
    private BigDecimal schemeFee;
    private BigDecimal interchangeFee;
    private BigDecimal acquirerMarkup;
    private BigDecimal totalFee;
    private BigDecimal netMerchantAmount;
    private String status;
    private boolean settled;
    private LocalDateTime txnDate;

    private Long authId;
    private Long merchantId;
    private String merchantName;
    private Long storeId;
    private String storeName;
    private Long terminalId;
    private String tid;
}
