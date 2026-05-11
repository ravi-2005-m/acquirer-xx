package com.acquirerx.settlement.settlement.controller;

import com.acquirerx.settlement.common.dto.PagedResponseDTO;
import com.acquirerx.settlement.common.pagination.PaginationParams;
import com.acquirerx.settlement.common.response.ApiResponse;
import com.acquirerx.settlement.settlement.dto.AdjustmentRequestDTO;
import com.acquirerx.settlement.settlement.dto.AdjustmentResponseDTO;
import com.acquirerx.settlement.settlement.dto.PayoutResponseDTO;
import com.acquirerx.settlement.settlement.dto.SettlementBatchResponseDTO;
import com.acquirerx.settlement.settlement.dto.SettlementFilterDTO;
import com.acquirerx.settlement.settlement.dto.SettlementStatsDTO;
import com.acquirerx.settlement.settlement.dto.SettlementSummaryDTO;
import com.acquirerx.settlement.settlement.service.SettlementService;
import io.swagger.v3.oas.annotations.Operation;
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

import java.util.List;

@RestController
@RequestMapping("/settlement")
@RequiredArgsConstructor
@Tag(name = "7. Settlement")
@Validated
public class SettlementController {

    private final SettlementService service;

    @Operation(summary = "Run settlement for a merchant")
    @PostMapping("/merchant/{merchantId:\\d+}")
    public ApiResponse<SettlementBatchResponseDTO> settle(@PathVariable Long merchantId) {
        return new ApiResponse<>("Settlement created", service.settle(merchantId));
    }

    @PostMapping("/payout/{settleBatchId:\\d+}")
    public ApiResponse<PayoutResponseDTO> processPayout(@PathVariable Long settleBatchId) {
        return new ApiResponse<>("Payout processed", service.processPayout(settleBatchId));
    }

    @PostMapping("/adjustments")
    public ApiResponse<AdjustmentResponseDTO> createAdjustment(@Valid @RequestBody AdjustmentRequestDTO dto) {
        return new ApiResponse<>("Adjustment created", service.createAdjustment(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<SettlementBatchResponseDTO>> getAll(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Settlements fetched", service.getAllSettlements(pagination));
    }

    @GetMapping("/merchant/{merchantId:\\d+}")
    public ApiResponse<PagedResponseDTO<SettlementBatchResponseDTO>> getByMerchant(
            @PathVariable Long merchantId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Settlements fetched", service.getSettlementsByMerchant(merchantId, pagination));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<SettlementBatchResponseDTO>> search(
            @Valid @RequestBody SettlementFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Settlements fetched", service.searchSettlements(filter, pagination));
    }

    @GetMapping("/{settleBatchId:\\d+}/payouts")
    public ApiResponse<List<PayoutResponseDTO>> getPayouts(@PathVariable Long settleBatchId) {
        return new ApiResponse<>("Payouts fetched", service.getPayoutsBySettlement(settleBatchId));
    }

    @GetMapping("/{settleBatchId:\\d+}/adjustments")
    public ApiResponse<List<AdjustmentResponseDTO>> getBatchAdjustments(@PathVariable Long settleBatchId) {
        return new ApiResponse<>("Adjustments fetched", service.getAdjustmentsByBatch(settleBatchId));
    }

    @GetMapping("/adjustments/merchant/{merchantId:\\d+}")
    public ApiResponse<PagedResponseDTO<AdjustmentResponseDTO>> getAdjustments(
            @PathVariable Long merchantId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Adjustments fetched", service.getAdjustmentsByMerchant(merchantId, pagination));
    }

    @GetMapping("/summary/merchant/{merchantId:\\d+}")
    public ApiResponse<SettlementSummaryDTO> getSummary(@PathVariable Long merchantId) {
        return new ApiResponse<>("Settlement summary fetched", service.getSettlementSummary(merchantId));
    }

    @GetMapping("/stats")
    public ApiResponse<SettlementStatsDTO> getStats() {
        return new ApiResponse<>("Settlement stats fetched", service.getStats());
    }
}
