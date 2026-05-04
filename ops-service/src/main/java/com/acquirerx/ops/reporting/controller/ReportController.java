package com.acquirerx.ops.reporting.controller;

import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.common.response.ApiResponse;
import com.acquirerx.ops.reporting.dto.ReportFilterDTO;
import com.acquirerx.ops.reporting.dto.ReportResponseDTO;
import com.acquirerx.ops.reporting.dto.ReportStatsDTO;
import com.acquirerx.ops.reporting.service.ReportingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "11. Reporting")
@Validated
public class ReportController {

    private final ReportingService service;

    @PostMapping("/merchant/{merchantId:\\d+}")
    public ApiResponse<ReportResponseDTO> generateMerchantReport(@PathVariable Long merchantId) {
        return new ApiResponse<>("Merchant report generated", service.generateMerchantReport(merchantId));
    }

    @PostMapping("/network")
    public ApiResponse<ReportResponseDTO> generateNetworkReport() {
        return new ApiResponse<>("Network report generated", service.generateNetworkReport());
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> getAll(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Reports fetched", service.getAll(pagination));
    }

    @GetMapping("/scope/{scope}")
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> getByScope(
            @PathVariable String scope,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Reports fetched", service.getByScope(scope, pagination));
    }

    @GetMapping("/merchant/{merchantId:\\d+}")
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> getByMerchant(
            @PathVariable Long merchantId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Reports fetched", service.getByMerchant(merchantId, pagination));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> searchReports(
            @Valid @RequestBody ReportFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Reports fetched", service.searchReports(filter, pagination));
    }

    @GetMapping("/stats")
    public ApiResponse<ReportStatsDTO> getReportStats() {
        return new ApiResponse<>("Report stats fetched", service.getReportStats());
    }
}
