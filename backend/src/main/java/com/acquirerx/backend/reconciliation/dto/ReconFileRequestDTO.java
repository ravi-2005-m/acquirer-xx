package com.acquirerx.backend.reconciliation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ReconFileRequestDTO {

    @NotBlank(message = "Source is required")
        @Pattern(regexp = "^(SWITCH|NETWORK|BANK)$",
            message = "Source must be SWITCH, NETWORK, or BANK")
    private String source;

    @NotNull(message = "File date is required")
    private LocalDate fileDate;

    @NotNull(message = "Items are required")
    @Size(min = 1, message = "At least one item is required")
    @Valid
    private List<ReconItemInputDTO> items;
}
