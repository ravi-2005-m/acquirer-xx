package com.acquirerx.backend.switchmodule.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RefundRequestDTO {

    @NotNull(message = "Original auth ID is required")
    private Long originalAuthId;

    @NotNull(message = "Terminal ID is required")
    private Long terminalId;

    @NotNull(message = "Refund amount is required")
    @Min(value = 1, message = "Refund amount must be at least 1")
    private Double amount;

    private String currency;
}
