package com.acquirerx.merchant.merchant.dto;

import com.acquirerx.merchant.common.enums.RiskLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MerchantRequestDTO {

    @NotBlank(message = "Legal name is required")
    @Size(min = 2, max = 200, message = "Legal name must be 2-200 characters")
    private String legalName;

    private String doingBusinessAs;

    @Pattern(regexp = "^[0-9]{4}$", message = "MCC must be a 4-digit code (e.g. 5411)")
    private String mcc;

    @NotBlank(message = "Contact info is required")
    private String contactInfo;

    private RiskLevel riskLevel;
}
