package com.acquirerx.backend.merchant.dto;

import lombok.Data;

@Data
public class MerchantFilterDTO {

    private String legalName;
    private String mcc;
    private String status;
    private String riskLevel;
    private String contactInfo;
}
