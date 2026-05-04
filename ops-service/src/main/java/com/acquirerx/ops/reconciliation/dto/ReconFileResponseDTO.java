package com.acquirerx.ops.reconciliation.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReconFileResponseDTO {

    private Long reconFileId;
    private String source;
    private LocalDate fileDate;
    private Integer rowCount;
    private String status;
    private LocalDateTime loadedAt;
}


