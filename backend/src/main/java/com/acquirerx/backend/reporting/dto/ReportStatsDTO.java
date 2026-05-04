package com.acquirerx.backend.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportStatsDTO {

    private Long totalReports;
    private Long merchantScopeReports;
    private Long networkScopeReports;

    private Long reportsGeneratedToday;
    private Long reportsGeneratedThisWeek;

    private Double highestChargebackRate;
    private Long reportsAbove1PctChargeback;
}
