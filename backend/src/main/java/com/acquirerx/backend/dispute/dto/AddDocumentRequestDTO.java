package com.acquirerx.backend.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AddDocumentRequestDTO {

    @NotNull(message = "Case ID is required")
    private Long caseId;

    @NotBlank(message = "Document type is required")
        @Pattern(regexp = "^(RECEIPT|INVOICE|DELIVERY_PROOF|COMMUNICATION)$",
            message = "Doc type must be RECEIPT, INVOICE, DELIVERY_PROOF, or COMMUNICATION")
    private String docType;

    @NotBlank(message = "URI is required")
    private String uri;
}
