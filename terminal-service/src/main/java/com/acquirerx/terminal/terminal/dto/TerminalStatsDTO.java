package com.acquirerx.terminal.terminal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TerminalStatsDTO {

    private Long totalTerminals;
    private Long activeTerminals;
    private Long inactiveTerminals;

    private Long emvCapable;
    private Long contactlessCapable;
    private Long magstripeOnly;

    private Long verifoneCount;
    private Long ingenicoCount;
    private Long otherBrandCount;

    private Long terminalsWithOpenBatch;
    private Long terminalsWithNoBatch;
}
