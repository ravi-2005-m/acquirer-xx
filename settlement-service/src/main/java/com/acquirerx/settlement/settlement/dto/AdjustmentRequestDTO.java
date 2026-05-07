package com.acquirerx.settlement.settlement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdjustmentRequestDTO {

    @NotNull(message = "Merchant ID is required")
    private Long merchantId;

    private Long txnId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Reason is required")
    @Size(min = 20, message = "Reason must be at least 20 characters")
    private String reason;

    @NotBlank(message = "Type is required")
    private String type;
}
