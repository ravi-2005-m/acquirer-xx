package com.acquirerx.auth.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditFilterDTO {

    private String actorUsername;
    private String action;
    private String targetId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
}
