package com.acquirerx.backend.risk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BlacklistRequestDTO {

    @NotBlank(message = "Type is required")
        @Pattern(regexp = "^(PAN|TERMINAL|MERCHANT)$",
            message = "Type must be PAN, TERMINAL, or MERCHANT")
    private String type;

    @NotBlank(message = "Value is required")
    private String value;

    @NotBlank(message = "Reason is required")
    @Size(min = 5, max = 500, message = "Reason must be 5-500 characters")
    private String reason;
}
