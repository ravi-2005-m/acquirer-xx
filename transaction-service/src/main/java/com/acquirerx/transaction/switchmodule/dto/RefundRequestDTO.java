package com.acquirerx.transaction.switchmodule.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RefundRequestDTO {

    @NotNull(message = "Original auth ID is required")
    private Long originalAuthId;

    @NotNull(message = "Terminal ID is required")
    private Long terminalId;

    @NotNull(message = "Refund amount is required")
    @DecimalMin(value = "1", message = "Refund amount must be at least 1")
    private BigDecimal amount;

    private String currency;
}
