package com.acquirerx.ops.reporting.controller;

import com.acquirerx.ops.common.response.ApiResponse;
import com.acquirerx.ops.reporting.dto.*;
import com.acquirerx.ops.reporting.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "12. Analytics")
public class AnalyticsController {

    private final AnalyticsService service;

    @GetMapping("/dashboard-summary")
    public ApiResponse<AnalyticsDashboardDTO> getDashboardSummary() {
        return new ApiResponse<>("Dashboard summary fetched", service.getDashboardSummary());
    }

    @GetMapping("/transaction-volume")
    public ApiResponse<TxnVolumeDTO> getTransactionVolume() {
        return new ApiResponse<>("Transaction volume fetched", service.getTransactionVolume());
    }

    @GetMapping("/settlement-summary")
    public ApiResponse<SettleAnalyticsDTO> getSettlementSummary() {
        return new ApiResponse<>("Settlement summary fetched", service.getSettlementSummary());
    }

    @GetMapping("/dispute-summary")
    public ApiResponse<Object> getDisputeSummary() {
        return new ApiResponse<>("Dispute summary fetched", service.getDisputeSummary());
    }

    @GetMapping("/risk-summary")
    public ApiResponse<RiskAnalyticsDTO> getRiskSummary() {
        return new ApiResponse<>("Risk summary fetched", service.getRiskSummary());
    }

    @GetMapping("/top-merchants")
    public ApiResponse<MerchantAnalyticsDTO> getMerchantAnalytics() {
        return new ApiResponse<>("Merchant analytics fetched", service.getMerchantAnalytics());
    }
}
