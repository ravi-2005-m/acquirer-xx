package com.acquirerx.risk.risk.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BlacklistResponseDTO {

    private Long blacklistId;
    private String type;
    private String value;
    private String reason;
    private Boolean active;
    private LocalDateTime createdAt;
    private String addedBy;
}
