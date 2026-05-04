package com.acquirerx.ops.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OpenDisputeRequestDTO {

    @NotNull(message = "Transaction ID is required")
    private Long txnId;

    @NotBlank(message = "PAN is required")
    @Pattern(regexp = "^[0-9]{6}[*X]{3,9}[0-9]{4}$", message = "PAN must be masked")
    private String panMasked;

    @NotBlank(message = "Reason code is required")
    @Size(min = 3, max = 50, message = "Reason code must be 3-50 characters")
    private String reasonCode;
}


