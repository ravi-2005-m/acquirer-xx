package com.acquirerx.ops.reporting.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportFilterDTO {

    private String scope;
    private Long scopeRefId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Double minChargebackRate;
    private Double maxChargebackRate;
}


