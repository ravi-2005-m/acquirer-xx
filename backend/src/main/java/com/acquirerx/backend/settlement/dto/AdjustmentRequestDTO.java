package com.acquirerx.backend.settlement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdjustmentRequestDTO {

    @NotNull(message = "Merchant ID is required")
    private Long merchantId;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String notes;
}
