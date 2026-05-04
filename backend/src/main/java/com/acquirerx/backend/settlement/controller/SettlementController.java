package com.acquirerx.backend.settlement.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.settlement.dto.AdjustmentRequestDTO;
import com.acquirerx.backend.settlement.dto.AdjustmentResponseDTO;
import com.acquirerx.backend.settlement.dto.PayoutResponseDTO;
import com.acquirerx.backend.settlement.dto.SettlementBatchResponseDTO;
import com.acquirerx.backend.settlement.dto.SettlementFilterDTO;
import com.acquirerx.backend.settlement.dto.SettlementSummaryDTO;
import com.acquirerx.backend.settlement.service.SettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/settlement")
@RequiredArgsConstructor
@Tag(name = "7. Settlement")
public class SettlementController {

    private final SettlementService service;

    @Operation(
            summary = "Run settlement for a merchant",
            description = "Collects all unsettled transactions, calculates gross/net amounts, creates settlement batch, marks transactions as settled."
    )
    @PostMapping("/merchant/{merchantId}")
    public ApiResponse<SettlementBatchResponseDTO> settle(@PathVariable Long merchantId) {
        return new ApiResponse<>("Settlement created", service.settle(merchantId));
    }

    @PostMapping("/payout/{settleBatchId}")
    public ApiResponse<PayoutResponseDTO> processPayout(@PathVariable Long settleBatchId) {
        return new ApiResponse<>("Payout processed", service.processPayout(settleBatchId));
    }

    @PostMapping("/adjustments")
    public ApiResponse<AdjustmentResponseDTO> createAdjustment(@Valid @RequestBody AdjustmentRequestDTO dto) {
        return new ApiResponse<>("Adjustment created", service.createAdjustment(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<SettlementBatchResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy) {
        return new ApiResponse<>("Settlements fetched", service.getAllSettlements(page, size, sortBy));
    }

    @GetMapping("/merchant/{merchantId}")
    public ApiResponse<PagedResponseDTO<SettlementBatchResponseDTO>> getByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Settlements fetched", service.getSettlementsByMerchant(merchantId, page, size));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<SettlementBatchResponseDTO>> search(
            @Valid @RequestBody SettlementFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy) {
        return new ApiResponse<>("Settlements fetched", service.searchSettlements(filter, page, size, sortBy));
    }

    @GetMapping("/{settleBatchId}/payouts")
    public ApiResponse<List<PayoutResponseDTO>> getPayouts(@PathVariable Long settleBatchId) {
        return new ApiResponse<>("Payouts fetched", service.getPayoutsBySettlement(settleBatchId));
    }

    @GetMapping("/adjustments/merchant/{merchantId}")
    public ApiResponse<PagedResponseDTO<AdjustmentResponseDTO>> getAdjustments(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Adjustments fetched", service.getAdjustmentsByMerchant(merchantId, page, size));
    }

    @GetMapping("/summary/merchant/{merchantId}")
    public ApiResponse<SettlementSummaryDTO> getSummary(@PathVariable Long merchantId) {
        return new ApiResponse<>("Settlement summary fetched", service.getSettlementSummary(merchantId));
    }
}
