package com.acquirerx.backend.switchmodule.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuthResponseDTO {

    private Long authId;
    private String txnType;
    private Double amount;
    private String currency;
    private String authCode;
    private String responseCode;
    private String network;
    private String status;
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
