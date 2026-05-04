package com.acquirerx.backend.switchmodule.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthorizeRequestDTO {

    @NotNull(message = "Terminal ID is required")
    private Long terminalId;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    private Double amount;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters (e.g. INR)")
    private String currency;

    private String panMasked;

    private String txnType;
}
