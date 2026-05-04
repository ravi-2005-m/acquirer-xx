package com.acquirerx.ops.dispute.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DisputeStatsDTO {

    private Long totalDisputes;
    private Long openDisputes;
    private Long closedDisputes;

    private Long retrievalCount;
    private Long chargebackCount;
    private Long representmentCount;
    private Long arbitrationCount;

    private Long expiredDeadlines;
    private Long deadlineWithin3Days;

    private Long openedToday;
    private Long closedToday;
}


