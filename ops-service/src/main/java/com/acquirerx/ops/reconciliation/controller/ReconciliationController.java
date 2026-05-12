package com.acquirerx.ops.reconciliation.controller;

import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.common.response.ApiResponse;
import com.acquirerx.ops.reconciliation.dto.ExceptionCaseResponseDTO;
import com.acquirerx.ops.reconciliation.dto.ReconFilterDTO;
import com.acquirerx.ops.reconciliation.dto.ReconFileRequestDTO;
import com.acquirerx.ops.reconciliation.dto.ReconFileResponseDTO;
import com.acquirerx.ops.reconciliation.dto.ReconItemResponseDTO;
import com.acquirerx.ops.reconciliation.dto.ReconSummaryDTO;
import com.acquirerx.ops.reconciliation.dto.ResolveExceptionDTO;
import com.acquirerx.ops.reconciliation.service.ReconciliationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recon")
@RequiredArgsConstructor
@Tag(name = "10. Reconciliation")
@Validated
public class ReconciliationController {

    private final ReconciliationService service;

    @Operation(
            summary = "Load and reconcile external file",
            description = "Loads external file (SWITCH/NETWORK/BANK), compares each item against system transactions. " +
                    "Items marked MATCHED/MISMATCHED/UNMATCHED and exceptions are created automatically for mismatches."
    )
    @PostMapping("/load")
    public ApiResponse<ReconFileResponseDTO> loadAndReconcile(@Valid @RequestBody ReconFileRequestDTO dto,
                                                              HttpServletRequest request) {
        Long userId = parseUserId(request.getHeader("X-User-Id"));
        return new ApiResponse<>("Reconciliation complete", service.loadAndReconcile(dto, userId));
    }

    private Long parseUserId(String header) {
        if (header == null || header.isBlank()) return null;
        try { return Long.parseLong(header); } catch (NumberFormatException e) { return null; }
    }

    @GetMapping("/files")
    public ApiResponse<PagedResponseDTO<ReconFileResponseDTO>> getAllFiles(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Recon files fetched", service.getAllFiles(pagination));
    }

    @PostMapping("/files/search")
    public ApiResponse<PagedResponseDTO<ReconFileResponseDTO>> searchFiles(
            @Valid @RequestBody ReconFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Recon files fetched", service.searchFiles(filter, pagination));
    }

    @GetMapping("/files/{id:\\d+}/items")
    public ApiResponse<PagedResponseDTO<ReconItemResponseDTO>> getItems(
            @PathVariable Long id,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Recon items fetched", service.getItemsByFile(id, pagination));
    }

    @PostMapping("/items/search")
    public ApiResponse<PagedResponseDTO<ReconItemResponseDTO>> searchItems(
            @Valid @RequestBody ReconFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Recon items fetched", service.searchItems(filter, pagination));
    }

    @GetMapping("/exceptions")
    public ApiResponse<PagedResponseDTO<ExceptionCaseResponseDTO>> getAllExceptions(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Exceptions fetched", service.getAllExceptions(pagination));
    }

    @GetMapping("/exceptions/open")
    public ApiResponse<PagedResponseDTO<ExceptionCaseResponseDTO>> getOpenExceptions(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Open exceptions fetched", service.getOpenExceptions(pagination));
    }

    @PostMapping("/exceptions/search")
    public ApiResponse<PagedResponseDTO<ExceptionCaseResponseDTO>> searchExceptions(
            @Valid @RequestBody ReconFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Exceptions fetched", service.searchExceptions(filter, pagination));
    }

    @GetMapping("/summary")
    public ApiResponse<ReconSummaryDTO> getSummary() {
        return new ApiResponse<>("Recon summary fetched", service.getReconSummary());
    }

    @GetMapping("/stats")
    public ApiResponse<ReconSummaryDTO> getStats() {
        return new ApiResponse<>("Recon stats fetched", service.getReconSummary());
    }

    @PatchMapping("/exceptions/{id:\\d+}/resolve")
    public ApiResponse<ExceptionCaseResponseDTO> resolveException(@PathVariable Long id,
                                                                  @Valid @RequestBody ResolveExceptionDTO dto) {
        return new ApiResponse<>("Exception resolved", service.resolveException(id, dto));
    }
}
