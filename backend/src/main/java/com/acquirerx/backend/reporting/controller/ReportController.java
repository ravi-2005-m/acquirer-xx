package com.acquirerx.backend.reporting.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.reporting.dto.ReportFilterDTO;
import com.acquirerx.backend.reporting.dto.ReportResponseDTO;
import com.acquirerx.backend.reporting.dto.ReportStatsDTO;
import com.acquirerx.backend.reporting.service.ReportingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "11. Reporting")
public class ReportController {

    private final ReportingService service;

    @PostMapping("/merchant/{merchantId}")
    public ApiResponse<ReportResponseDTO> generateMerchantReport(@PathVariable Long merchantId) {
        return new ApiResponse<>("Merchant report generated", service.generateMerchantReport(merchantId));
    }

    @PostMapping("/network")
    public ApiResponse<ReportResponseDTO> generateNetworkReport() {
        return new ApiResponse<>("Network report generated", service.generateNetworkReport());
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Reports fetched", service.getAll(page, size));
    }

    @GetMapping("/scope/{scope}")
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> getByScope(
            @PathVariable String scope,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Reports fetched", service.getByScope(scope, page, size));
    }

    @GetMapping("/merchant/{merchantId}")
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> getByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Reports fetched", service.getByMerchant(merchantId, page, size));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<ReportResponseDTO>> searchReports(
            @Valid @RequestBody ReportFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Reports fetched", service.searchReports(filter, page, size));
    }

    @GetMapping("/stats")
    public ApiResponse<ReportStatsDTO> getReportStats() {
        return new ApiResponse<>("Report stats fetched", service.getReportStats());
    }
}
