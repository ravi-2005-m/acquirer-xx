package com.acquirerx.ops.reconciliation.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExceptionCaseResponseDTO {

    private Long exceptionId;
    private String referenceId;
    private String category;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
}


