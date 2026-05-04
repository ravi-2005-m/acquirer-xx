package com.acquirerx.backend.merchant.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.merchant.dto.MerchantFilterDTO;
import com.acquirerx.backend.merchant.dto.MerchantRequestDTO;
import com.acquirerx.backend.merchant.dto.MerchantResponseDTO;
import com.acquirerx.backend.merchant.dto.MerchantStatsDTO;
import com.acquirerx.backend.merchant.service.MerchantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/merchants")
@RequiredArgsConstructor
@Tag(name = "2. Merchants")
public class MerchantController {

    private final MerchantService service;

    @PostMapping
    public ApiResponse<MerchantResponseDTO> create(@Valid @RequestBody MerchantRequestDTO dto) {
        return new ApiResponse<>("Merchant created", service.create(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<MerchantResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "legalName") String sortBy) {
        return new ApiResponse<>("Merchants fetched", service.getAll(page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ApiResponse<MerchantResponseDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Merchant fetched", service.getMerchantById(id));
    }

    @GetMapping("/status/{status}")
    public ApiResponse<PagedResponseDTO<MerchantResponseDTO>> getByStatus(
            @PathVariable Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Merchants fetched", service.getByStatus(status, page, size));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<MerchantResponseDTO>> search(
            @Valid @RequestBody MerchantFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Merchants fetched", service.searchMerchants(filter, page, size));
    }

    @GetMapping("/stats")
    public ApiResponse<MerchantStatsDTO> getStats() {
        return new ApiResponse<>("Merchant stats fetched", service.getMerchantStats());
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<MerchantResponseDTO> updateStatus(@PathVariable Long id,
                                                         @RequestParam Status newStatus) {
        return new ApiResponse<>("Status updated", service.updateStatus(id, newStatus));
    }
}
