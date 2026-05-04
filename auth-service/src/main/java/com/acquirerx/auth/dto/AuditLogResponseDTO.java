package com.acquirerx.auth.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogResponseDTO {

    private Long auditId;
    private String actorUsername;
    private String action;
    private String targetType;
    private String targetId;
    private String details;
    private LocalDateTime performedAt;
}
