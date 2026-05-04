package com.acquirerx.ops.reconciliation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReconSummaryDTO {

    private Long totalFiles;
    private Long processedFiles;
    private Long failedFiles;
    private Long loadedFiles;

    private Long totalItems;
    private Long matchedItems;
    private Long mismatchedItems;
    private Long unmatchedItems;

    private Double matchRate;

    private Long totalExceptions;
    private Long openExceptions;
    private Long resolvedExceptions;
    private Long writtenOffExceptions;

    private Long filesLoadedToday;
    private Long exceptionsCreatedToday;
}


