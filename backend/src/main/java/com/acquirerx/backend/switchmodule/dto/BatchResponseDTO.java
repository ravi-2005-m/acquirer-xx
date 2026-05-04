package com.acquirerx.backend.switchmodule.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BatchResponseDTO {

    private Long batchId;
    private String status;
    private LocalDateTime openTime;
    private LocalDateTime closeTime;

    private Long terminalId;
    private String tid;
    private Long merchantId;
    private String merchantName;
}
