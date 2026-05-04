package com.acquirerx.backend.reconciliation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResolveExceptionDTO {

    @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(RESOLVED|WRITTEN_OFF)$",
            message = "Status must be RESOLVED or WRITTEN_OFF")
    private String status;

    private String notes;
}
