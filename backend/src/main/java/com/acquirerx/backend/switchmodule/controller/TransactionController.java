package com.acquirerx.backend.switchmodule.controller;

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
import com.acquirerx.backend.switchmodule.dto.AuthResponseDTO;
import com.acquirerx.backend.switchmodule.dto.AuthorizeRequestDTO;
import com.acquirerx.backend.switchmodule.dto.BatchResponseDTO;
import com.acquirerx.backend.switchmodule.dto.RefundRequestDTO;
import com.acquirerx.backend.switchmodule.dto.TransactionFilterDTO;
import com.acquirerx.backend.switchmodule.dto.VoidRequestDTO;
import com.acquirerx.backend.switchmodule.service.SwitchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "5. Transactions")
public class TransactionController {

    private final SwitchService service;

    @PostMapping("/batch/open/{terminalId}")
    public ApiResponse<BatchResponseDTO> openBatch(@PathVariable Long terminalId) {
        return new ApiResponse<>("Batch opened", service.openBatch(terminalId));
    }

    @PostMapping("/batch/close/{terminalId}")
    public ApiResponse<BatchResponseDTO> closeBatch(@PathVariable Long terminalId) {
        return new ApiResponse<>("Batch closed", service.closeBatch(terminalId));
    }

        @Operation(
            summary = "Authorize a transaction",
            description = "Runs risk check (blacklist + rules), masks PAN, then authorizes or declines based on risk result and amount limit."
        )
    @PostMapping("/authorize")
    public ApiResponse<AuthResponseDTO> authorize(@Valid @RequestBody AuthorizeRequestDTO dto) {
        return new ApiResponse<>("Transaction processed", service.authorize(dto));
    }

        @Operation(
            summary = "Void an unsettled transaction",
            description = "Cancels an approved SALE that has not been settled yet. Original auth status changes to REVERSED."
        )
    @PostMapping("/void")
    public ApiResponse<AuthResponseDTO> voidTransaction(
            @Valid @RequestBody VoidRequestDTO dto) {
        return new ApiResponse<>("Transaction voided", service.voidTransaction(dto));
    }

        @Operation(
            summary = "Refund a settled transaction",
            description = "Returns money for a settled transaction. Can be partial refund. Amount cannot exceed original."
        )
    @PostMapping("/refund")
    public ApiResponse<AuthResponseDTO> refundTransaction(
            @Valid @RequestBody RefundRequestDTO dto) {
        return new ApiResponse<>("Refund processed", service.refundTransaction(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<AuthResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "txnTime") String sortBy) {
        return new ApiResponse<>("Transactions fetched",
                service.getAll(page, size, sortBy));
    }

    @GetMapping("/merchant/{merchantId}")
    public ApiResponse<PagedResponseDTO<AuthResponseDTO>> getByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Transactions fetched",
                service.getByMerchant(merchantId, page, size));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<AuthResponseDTO>> search(
            @Valid @RequestBody TransactionFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "txnTime") String sortBy) {
        return new ApiResponse<>("Transactions fetched",
                service.search(filter, page, size, sortBy));
    }

    @GetMapping("/batches/{terminalId}")
    public ApiResponse<List<BatchResponseDTO>> getBatches(@PathVariable Long terminalId) {
        return new ApiResponse<>("Batches fetched", service.getBatchesByTerminal(terminalId));
    }
}
