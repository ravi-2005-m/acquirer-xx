package com.acquirerx.backend.switchmodule.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoidRequestDTO {

    @NotNull(message = "Original auth ID is required")
    private Long originalAuthId;

    @NotNull(message = "Terminal ID is required")
    private Long terminalId;
}
