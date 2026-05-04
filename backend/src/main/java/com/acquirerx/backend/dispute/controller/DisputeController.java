package com.acquirerx.backend.dispute.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.enums.DisputeStage;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.dispute.dto.AddDocumentRequestDTO;
import com.acquirerx.backend.dispute.dto.DisputeActionRequestDTO;
import com.acquirerx.backend.dispute.dto.DisputeActionResponseDTO;
import com.acquirerx.backend.dispute.dto.DisputeCaseResponseDTO;
import com.acquirerx.backend.dispute.dto.DisputeFilterDTO;
import com.acquirerx.backend.dispute.dto.DisputeStatsDTO;
import com.acquirerx.backend.dispute.dto.DisputeDocumentResponseDTO;
import com.acquirerx.backend.dispute.dto.OpenDisputeRequestDTO;
import com.acquirerx.backend.dispute.service.DisputeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/disputes")
@RequiredArgsConstructor
@Tag(name = "9. Disputes")
public class DisputeController {

    private final DisputeService service;

    @PostMapping
    public ApiResponse<DisputeCaseResponseDTO> openDispute(@Valid @RequestBody OpenDisputeRequestDTO dto) {
        return new ApiResponse<>("Dispute opened", service.openDispute(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "openedDate") String sortBy) {
        return new ApiResponse<>("Disputes fetched", service.getAll(page, size, sortBy));
    }

    @GetMapping("/open")
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> getOpen(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Open disputes fetched", service.getOpenDisputes(page, size));
    }

    @GetMapping("/stage/{stage}")
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> getByStage(
            @PathVariable DisputeStage stage,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Disputes fetched", service.getByStage(stage, page, size));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<DisputeCaseResponseDTO>> search(
            @Valid @RequestBody DisputeFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Disputes fetched", service.searchDisputes(filter, page, size));
    }

    @GetMapping("/stats")
    public ApiResponse<DisputeStatsDTO> getStats() {
        return new ApiResponse<>("Dispute stats fetched", service.getDisputeStats());
    }

    @PatchMapping("/{id}/advance")
    public ApiResponse<DisputeCaseResponseDTO> advanceStage(@PathVariable Long id) {
        return new ApiResponse<>("Stage advanced", service.advanceStage(id));
    }

    @PatchMapping("/{id}/close")
    public ApiResponse<DisputeCaseResponseDTO> closeDispute(@PathVariable Long id) {
        return new ApiResponse<>("Dispute closed", service.closeDispute(id));
    }

    @PostMapping("/documents")
    public ApiResponse<DisputeDocumentResponseDTO> addDocument(@Valid @RequestBody AddDocumentRequestDTO dto) {
        return new ApiResponse<>("Document added", service.addDocument(dto));
    }

    @GetMapping("/{id}/documents")
    public ApiResponse<List<DisputeDocumentResponseDTO>> getDocuments(@PathVariable Long id) {
        return new ApiResponse<>("Documents fetched", service.getDocuments(id));
    }

    @PostMapping("/actions")
    public ApiResponse<DisputeActionResponseDTO> addAction(@Valid @RequestBody DisputeActionRequestDTO dto) {
        return new ApiResponse<>("Action logged", service.addAction(dto));
    }

    @GetMapping("/{id}/actions")
    public ApiResponse<List<DisputeActionResponseDTO>> getActions(@PathVariable Long id) {
        return new ApiResponse<>("Actions fetched", service.getActions(id));
    }
}
