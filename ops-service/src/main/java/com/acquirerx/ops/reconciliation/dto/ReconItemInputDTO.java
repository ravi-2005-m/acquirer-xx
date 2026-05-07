package com.acquirerx.ops.reconciliation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReconItemInputDTO {

    @NotBlank(message = "Reference is required")
    private String reference;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0", message = "Amount cannot be negative")
    private BigDecimal amount;
}


