package com.acquirerx.transaction.switchmodule.controller;

import com.acquirerx.transaction.common.dto.PagedResponseDTO;
import com.acquirerx.transaction.common.pagination.PaginationParams;
import com.acquirerx.transaction.common.response.ApiResponse;
import com.acquirerx.transaction.idempotency.IdempotencyResult;
import com.acquirerx.transaction.idempotency.IdempotencyService;
import com.acquirerx.transaction.switchmodule.dto.*;
import com.acquirerx.transaction.switchmodule.service.SwitchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "3. Transactions (Switch)")
@Validated
public class TransactionController {

    private final SwitchService service;
    private final IdempotencyService idempotencyService;

    @PostMapping("/transactions/batch/{terminalId:\\d+}/open")
    public ApiResponse<BatchResponseDTO> openBatch(@PathVariable Long terminalId) {
        return new ApiResponse<>("Batch opened", service.openBatch(terminalId));
    }

    @PostMapping("/transactions/batch/{terminalId:\\d+}/close")
    public ApiResponse<BatchResponseDTO> closeBatch(@PathVariable Long terminalId) {
        return new ApiResponse<>("Batch closed", service.closeBatch(terminalId));
    }

    @PostMapping("/transactions/authorize")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> authorize(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody AuthorizeRequestDTO dto) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return ResponseEntity.ok(new ApiResponse<>("Transaction authorized", service.authorize(dto)));
        }

        IdempotencyResult<AuthResponseDTO> result = idempotencyService.execute(
                idempotencyKey,
                "POST /transactions/authorize",
                dto,
                () -> service.authorize(dto),
                AuthResponseDTO.class
        );

        return ResponseEntity.status(result.getHttpStatus())
                .header("Idempotent-Replayed", String.valueOf(result.isReplayed()))
                .body(new ApiResponse<>(
                        result.isReplayed() ? "Authorization replayed (idempotent)" : "Transaction authorized",
                        result.getResponse()));
    }

    @PostMapping("/transactions/void")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> voidTransaction(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody VoidRequestDTO dto) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return ResponseEntity.ok(new ApiResponse<>("Transaction voided", service.voidTransaction(dto)));
        }

        IdempotencyResult<AuthResponseDTO> result = idempotencyService.execute(
                idempotencyKey,
                "POST /transactions/void",
                dto,
                () -> service.voidTransaction(dto),
                AuthResponseDTO.class
        );

        return ResponseEntity.status(result.getHttpStatus())
                .header("Idempotent-Replayed", String.valueOf(result.isReplayed()))
                .body(new ApiResponse<>(
                        result.isReplayed() ? "Void replayed (idempotent)" : "Transaction voided",
                        result.getResponse()));
    }

    @PostMapping("/transactions/refund")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> refundTransaction(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody RefundRequestDTO dto) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return ResponseEntity.ok(new ApiResponse<>("Transaction refunded", service.refundTransaction(dto)));
        }

        IdempotencyResult<AuthResponseDTO> result = idempotencyService.execute(
                idempotencyKey,
                "POST /transactions/refund",
                dto,
                () -> service.refundTransaction(dto),
                AuthResponseDTO.class
        );

        return ResponseEntity.status(result.getHttpStatus())
                .header("Idempotent-Replayed", String.valueOf(result.isReplayed()))
                .body(new ApiResponse<>(
                        result.isReplayed() ? "Refund replayed (idempotent)" : "Transaction refunded",
                        result.getResponse()));
    }

    @GetMapping("/transactions")
    public ApiResponse<PagedResponseDTO<AuthResponseDTO>> getAll(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Transactions fetched", service.getAll(pagination));
    }

    @GetMapping("/transactions/{authId:\\d+}")
    public ApiResponse<AuthResponseDTO> getAuthById(@PathVariable Long authId) {
        return new ApiResponse<>("Transaction fetched", service.getAuthById(authId));
    }

    @PostMapping("/transactions/search")
    public ApiResponse<PagedResponseDTO<AuthResponseDTO>> search(
            @Valid @RequestBody TransactionFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Transactions fetched", service.search(filter, pagination));
    }

    @GetMapping("/transactions/batch/{terminalId:\\d+}")
    public ApiResponse<java.util.List<BatchResponseDTO>> getBatches(@PathVariable Long terminalId) {
        return new ApiResponse<>("Batches fetched", service.getBatchesByTerminal(terminalId));
    }

    @GetMapping("/transactions/batch/merchant/{merchantId:\\d+}/has-open")
    public ApiResponse<Boolean> hasOpenBatches(@PathVariable Long merchantId) {
        return new ApiResponse<>("Open batch status checked", service.hasOpenBatchesForMerchant(merchantId));
    }

    @PostMapping("/transactions/stats")
    public ApiResponse<TransactionStatsDTO> getStats(
            @RequestBody(required = false) TransactionFilterDTO filter) {
        if (filter == null) filter = new TransactionFilterDTO();
        return new ApiResponse<>("Transaction stats fetched", service.getStats(filter));
    }
}
