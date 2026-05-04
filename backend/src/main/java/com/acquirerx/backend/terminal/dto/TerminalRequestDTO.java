package com.acquirerx.backend.terminal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TerminalRequestDTO {

    @NotBlank(message = "TID is required")
    @Size(min = 3, max = 20, message = "TID must be 3-20 characters")
    private String tid;

    @NotBlank(message = "Brand/model is required")
    private String brandModel;

    @NotBlank(message = "Capability is required")
    @Pattern(regexp = "^(EMV|CTLS|MAGSTRIPE)$",
            message = "Capability must be EMV, CTLS, or MAGSTRIPE")
    private String capability;
}
