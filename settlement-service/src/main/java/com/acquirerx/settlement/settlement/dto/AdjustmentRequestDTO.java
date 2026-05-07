package com.acquirerx.settlement.settlement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdjustmentRequestDTO {

    @NotNull(message = "Merchant ID is required")
    private Long merchantId;

    private Long txnId;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Type is required")
    private String type;
}
