package com.acquirerx.backend.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OpenDisputeRequestDTO {

    @NotNull(message = "Transaction ID is required")
    private Long txnId;

    @NotBlank(message = "Reason code is required")
    @Size(min = 3, max = 50, message = "Reason code must be 3-50 characters")
    private String reasonCode;
}
