package com.acquirerx.backend.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DisputeActionRequestDTO {

    @NotNull(message = "Case ID is required")
    private Long caseId;

    @NotBlank(message = "Action type is required")
        @Pattern(regexp = "^(REQUEST_DOCS|SUBMIT_EVIDENCE|ACCEPT|REJECT|WRITE_OFF|ESCALATE)$",
            message = "Action type must be REQUEST_DOCS, SUBMIT_EVIDENCE, ACCEPT, REJECT, WRITE_OFF, or ESCALATE")
    private String actionType;

    @NotNull(message = "Actor ID is required")
    private Long actorId;

    private String notes;
}
