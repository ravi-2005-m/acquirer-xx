package com.acquirerx.transaction.fee.controller;

import com.acquirerx.transaction.common.dto.PagedResponseDTO;
import com.acquirerx.transaction.common.pagination.PaginationParams;
import com.acquirerx.transaction.common.response.ApiResponse;
import com.acquirerx.transaction.fee.dto.*;
import com.acquirerx.transaction.fee.service.FeeService;
import com.acquirerx.transaction.idempotency.IdempotencyResult;
import com.acquirerx.transaction.idempotency.IdempotencyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "6. Transactions (Fee)")
@Validated
public class FeeController {

    private final FeeService service;
    private final IdempotencyService idempotencyService;

    @PostMapping("/txns/from-auth/{authId:\\d+}")
    public ResponseEntity<ApiResponse<TxnResponseDTO>> createTxnFromAuth(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @PathVariable Long authId) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return ResponseEntity.ok(new ApiResponse<>("Txn created from auth", service.createTxnFromAuth(authId)));
        }

        IdempotencyResult<TxnResponseDTO> result = idempotencyService.execute(
                idempotencyKey,
                "POST /txns/from-auth",
                Map.of("authId", authId),
                () -> service.createTxnFromAuth(authId),
                TxnResponseDTO.class
        );

        return ResponseEntity.status(result.getHttpStatus())
                .header("Idempotent-Replayed", String.valueOf(result.isReplayed()))
                .body(new ApiResponse<>(
                        result.isReplayed() ? "Txn creation replayed (idempotent)" : "Txn created from auth",
                        result.getResponse()));
    }

    @GetMapping("/txns/{txnId:\\d+}")
    public ApiResponse<TxnResponseDTO> getTxn(@PathVariable Long txnId) {
        return new ApiResponse<>("Txn fetched", service.getTxn(txnId));
    }

    @GetMapping("/txns/by-auth/{authId:\\d+}")
    public ApiResponse<TxnResponseDTO> getTxnByAuthId(@PathVariable Long authId) {
        return new ApiResponse<>("Txn fetched", service.getTxnByAuthId(authId));
    }

    @GetMapping("/txns")
    public ApiResponse<PagedResponseDTO<TxnResponseDTO>> getAllTxns(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Txns fetched", service.getAllTxns(pagination));
    }

    @GetMapping("/txns/merchant/{merchantId:\\d+}")
    public ApiResponse<PagedResponseDTO<TxnResponseDTO>> getTxnsByMerchant(
            @PathVariable Long merchantId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Txns fetched", service.getTxnsByMerchant(merchantId, pagination));
    }

    @GetMapping("/txns/all")
    public ApiResponse<List<TxnResponseDTO>> getAllTxnsForRecon() {
        return new ApiResponse<>("All txns fetched", service.getAllTxnsForRecon());
    }

    @PostMapping("/txns/search")
    public ApiResponse<PagedResponseDTO<TxnResponseDTO>> searchTxns(
            @Valid @RequestBody TxnFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Txns fetched", service.searchTxns(filter, pagination));
    }

    @GetMapping("/merchants/{merchantId:\\d+}/fee-summary")
    public ApiResponse<FeeSummaryDTO> getFeeSummary(@PathVariable Long merchantId) {
        return new ApiResponse<>("Fee summary fetched", service.getFeeSummary(merchantId));
    }

    @GetMapping("/txns/merchant/{merchantId:\\d+}/unsettled")
    public ApiResponse<List<TxnResponseDTO>> getUnsettledTxns(@PathVariable Long merchantId) {
        return new ApiResponse<>("Unsettled txns fetched", service.getUnsettledTxns(merchantId));
    }

    @GetMapping("/txns/stats")
    public ApiResponse<TxnStatsDTO> getTxnStats() {
        return new ApiResponse<>("Transaction stats fetched", service.getTxnStats());
    }

    @PutMapping("/txns/merchant/{merchantId:\\d+}/mark-settled")
    public ApiResponse<String> markTxnsSettled(@PathVariable Long merchantId) {
        service.markTxnsSettled(merchantId);
        return new ApiResponse<>("Txns marked settled", "Done");
    }
}
