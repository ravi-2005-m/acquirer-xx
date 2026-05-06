package com.acquirerx.ops.dispute.controller;

import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.DisputeStage;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.common.response.ApiResponse;
import com.acquirerx.ops.dispute.dto.AddDocumentRequestDTO;
import com.acquirerx.ops.dispute.dto.DisputeActionRequestDTO;
import com.acquirerx.ops.dispute.dto.DisputeActionResponseDTO;
import com.acquirerx.ops.dispute.dto.DisputeCaseResponseDTO;
import com.acquirerx.ops.dispute.dto.DisputeFilterDTO;
import com.acquirerx.ops.dispute.dto.DisputeStatsDTO;
import com.acquirerx.ops.dispute.dto.DisputeDocumentResponseDTO;
import com.acquirerx.ops.dispute.dto.OpenDisputeRequestDTO;
import com.acquirerx.ops.dispute.service.DisputeService;
import io.swagger.v3.oas.annotations.tags.Tag;
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

import java.util.List;

@RestController
@RequestMapping("/disputes")
@RequiredArgsConstructor
@Tag(name = "9. Disputes")
@Validated
public class DisputeController {

    private final DisputeService service;

    @PostMapping
    public ApiResponse<DisputeCaseResponseDTO> openDispute(@Valid @RequestBody OpenDisputeRequestDTO dto) {
        return new ApiResponse<>("Dispute opened", service.openDispute(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> getAll(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Disputes fetched", service.getAll(pagination));
    }

    @GetMapping("/{id:\\d+}")
    public ApiResponse<DisputeCaseResponseDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Dispute fetched", service.getCaseById(id));
    }

    @GetMapping("/open")
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> getOpen(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Open disputes fetched", service.getOpenDisputes(pagination));
    }

    @GetMapping("/stage/{stage}")
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> getByStage(
            @PathVariable DisputeStage stage,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Disputes fetched", service.getByStage(stage, pagination));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> search(
            @Valid @RequestBody DisputeFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Disputes fetched", service.searchDisputes(filter, pagination));
    }

    @GetMapping("/stats")
    public ApiResponse<DisputeStatsDTO> getStats() {
        return new ApiResponse<>("Dispute stats fetched", service.getDisputeStats());
    }

    @PostMapping("/summary")
    public ApiResponse<DisputeStatsDTO> getSummary(@RequestBody(required = false) DisputeFilterDTO filter) {
        return new ApiResponse<>("Dispute summary fetched", service.getDisputeStats());
    }

    @PatchMapping("/{id:\\d+}/advance")
    public ApiResponse<DisputeCaseResponseDTO> advanceStage(@PathVariable Long id) {
        return new ApiResponse<>("Stage advanced", service.advanceStage(id));
    }

    @PatchMapping("/{id:\\d+}/close")
    public ApiResponse<DisputeCaseResponseDTO> closeDispute(@PathVariable Long id) {
        return new ApiResponse<>("Dispute closed", service.closeDispute(id));
    }

    @PostMapping("/documents")
    public ApiResponse<DisputeDocumentResponseDTO> addDocument(@Valid @RequestBody AddDocumentRequestDTO dto) {
        return new ApiResponse<>("Document added", service.addDocument(dto));
    }

    @GetMapping("/{id:\\d+}/documents")
    public ApiResponse<List<DisputeDocumentResponseDTO>> getDocuments(@PathVariable Long id) {
        return new ApiResponse<>("Documents fetched", service.getDocuments(id));
    }

    @PostMapping("/actions")
    public ApiResponse<DisputeActionResponseDTO> addAction(@Valid @RequestBody DisputeActionRequestDTO dto) {
        return new ApiResponse<>("Action logged", service.addAction(dto));
    }

    @GetMapping("/{id:\\d+}/actions")
    public ApiResponse<List<DisputeActionResponseDTO>> getActions(@PathVariable Long id) {
        return new ApiResponse<>("Actions fetched", service.getActions(id));
    }
}
