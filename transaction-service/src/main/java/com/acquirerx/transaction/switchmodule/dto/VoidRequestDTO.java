package com.acquirerx.transaction.switchmodule.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VoidRequestDTO {

    @NotNull(message = "Original auth ID is required")
    @Positive(message = "Original auth ID must be positive")
    private Long originalAuthId;

    @NotNull(message = "Terminal ID is required")
    @Positive(message = "Terminal ID must be positive")
    private Long terminalId;
}
