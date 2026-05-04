package com.acquirerx.backend.fee.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TxnResponseDTO {

    private Long txnId;
    private Double amount;
    private String currency;
    private Double schemeFee;
    private Double interchangeFee;
    private Double acquirerMarkup;
    private Double totalFee;
    private Double netMerchantAmount;
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
