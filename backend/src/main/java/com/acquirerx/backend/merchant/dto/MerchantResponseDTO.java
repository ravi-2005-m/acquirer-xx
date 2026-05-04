package com.acquirerx.backend.merchant.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MerchantResponseDTO {

    private Long merchantId;
    private String legalName;
    private String doingBusinessAs;
    private String mcc;
    private String contactInfo;
    private String riskLevel;
    private String status;
    private LocalDateTime createdAt;
}
