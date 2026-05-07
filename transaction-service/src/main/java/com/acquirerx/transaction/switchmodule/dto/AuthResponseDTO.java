package com.acquirerx.transaction.switchmodule.dto;

import com.acquirerx.transaction.common.serialization.MaskedPanSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AuthResponseDTO {

    private Long authId;
    private String txnType;
    private BigDecimal amount;
    private String currency;
    private String authCode;
    private String responseCode;
    private String network;
    private String status;

    @JsonSerialize(using = MaskedPanSerializer.class)
    private String panMasked;

    private LocalDateTime txnTime;
    private Integer riskScore;
    private String riskReason;
    private Long originalAuthId;

    private Long terminalId;
    private String tid;

    private Long merchantId;
    private String merchantName;
}
