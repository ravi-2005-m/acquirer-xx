package com.acquirerx.backend.dispute.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DisputeActionResponseDTO {

    private Long actionId;
    private Long caseId;
    private String actionType;
    private Long actorId;
    private String notes;
    private LocalDateTime actionDate;
}
