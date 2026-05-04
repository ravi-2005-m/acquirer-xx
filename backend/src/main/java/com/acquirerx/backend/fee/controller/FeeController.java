package com.acquirerx.backend.fee.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.fee.dto.FeeSummaryDTO;
import com.acquirerx.backend.fee.dto.FeeRuleRequestDTO;
import com.acquirerx.backend.fee.dto.FeeRuleResponseDTO;
import com.acquirerx.backend.fee.dto.TxnFilterDTO;
import com.acquirerx.backend.fee.dto.TxnResponseDTO;
import com.acquirerx.backend.fee.service.FeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "6. Fee Engine")
public class FeeController {

    private final FeeService service;

    // POST /fee-rules — Create a fee rule
    @PostMapping("/fee-rules")
    public ApiResponse<FeeRuleResponseDTO> createFeeRule(@Valid @RequestBody FeeRuleRequestDTO dto) {
        return new ApiResponse<>("Fee rule created", service.createFeeRule(dto));
    }

    // GET /fee-rules — Get all active fee rules
    @GetMapping("/fee-rules")
    public ApiResponse<List<FeeRuleResponseDTO>> getActiveFeeRules() {
        return new ApiResponse<>("Fee rules fetched", service.getActiveFeeRules());
    }

    // PATCH /fee-rules/1/deactivate — Deactivate a fee rule
    @PatchMapping("/fee-rules/{id}/deactivate")
    public ApiResponse<FeeRuleResponseDTO> deactivate(@PathVariable Long id) {
        return new ApiResponse<>("Fee rule deactivated", service.deactivateFeeRule(id));
    }

    // POST /txns/from-auth/1 — Create txn from approved auth
    @Operation(
            summary = "Create fee record from authorized transaction",
            description = "Calculates fees using active fee rules (MDR + scheme + interchange) and creates a Txn record with full fee breakdown."
    )
    @PostMapping("/txns/from-auth/{authId}")
    public ApiResponse<TxnResponseDTO> createTxn(@PathVariable Long authId) {
        return new ApiResponse<>("Transaction recorded", service.createTxnFromAuth(authId));
    }

    // GET /txns — Get all transactions
    @GetMapping("/txns")
    public ApiResponse<PagedResponseDTO<TxnResponseDTO>> getAllTxns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "txnDate") String sortBy
    ) {
        return new ApiResponse<>("Transactions fetched", service.getAllTxns(page, size, sortBy));
    }

    // GET /txns/merchant/1 — Get transactions of merchant 1
    @GetMapping("/txns/merchant/{merchantId}")
    public ApiResponse<PagedResponseDTO<TxnResponseDTO>> getTxnsByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return new ApiResponse<>("Transactions fetched", service.getTxnsByMerchant(merchantId, page, size));
    }

    @PostMapping("/txns/search")
    public ApiResponse<PagedResponseDTO<TxnResponseDTO>> searchTxns(
            @Valid @RequestBody TxnFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "txnDate") String sortBy
    ) {
        return new ApiResponse<>("Filtered transactions fetched", service.searchTxns(filter, page, size, sortBy));
    }

    @GetMapping("/txns/summary/merchant/{merchantId}")
    public ApiResponse<FeeSummaryDTO> getMerchantSummary(@PathVariable Long merchantId) {
        return new ApiResponse<>("Fee summary generated", service.getFeeSummary(merchantId));
    }
}
