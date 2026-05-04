package com.acquirerx.ops.dispute.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DisputeDocumentResponseDTO {

    private Long docId;
    private Long caseId;
    private String docType;
    private String uri;
    private LocalDateTime uploadedDate;
}


