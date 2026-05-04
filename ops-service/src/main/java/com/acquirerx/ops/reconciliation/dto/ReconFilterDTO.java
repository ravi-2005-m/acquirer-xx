package com.acquirerx.ops.reconciliation.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ReconFilterDTO {

    private String source;
    private String fileStatus;
    private LocalDate fromDate;
    private LocalDate toDate;

    private String matchStatus;
    private Long reconFileId;

    private String category;
    private String exceptionStatus;
}


