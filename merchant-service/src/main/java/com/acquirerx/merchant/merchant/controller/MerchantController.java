package com.acquirerx.merchant.merchant.controller;

import com.acquirerx.merchant.common.dto.PagedResponseDTO;
import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.common.pagination.PaginationParams;
import com.acquirerx.merchant.common.response.ApiResponse;
import com.acquirerx.merchant.merchant.dto.MerchantFilterDTO;
import com.acquirerx.merchant.merchant.dto.MerchantRequestDTO;
import com.acquirerx.merchant.merchant.dto.MerchantResponseDTO;
import com.acquirerx.merchant.merchant.dto.MerchantStatsDTO;
import com.acquirerx.merchant.merchant.service.MerchantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/merchants")
@RequiredArgsConstructor
@Tag(name = "2. Merchants")
@Validated
public class MerchantController {

    private final MerchantService service;

    @PostMapping
    public ApiResponse<MerchantResponseDTO> create(@Valid @RequestBody MerchantRequestDTO dto) {
        return new ApiResponse<>("Merchant created", service.create(dto));
    }

    @GetMapping
    public ApiResponse<PagedResponseDTO<MerchantResponseDTO>> getAll(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Merchants fetched", service.getAll(pagination));
    }

    @GetMapping("/{id:\\d+}")
    public ApiResponse<MerchantResponseDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Merchant fetched", service.getMerchantById(id));
    }

    @GetMapping("/status/{status}")
    public ApiResponse<PagedResponseDTO<MerchantResponseDTO>> getByStatus(
            @PathVariable Status status,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Merchants fetched", service.getByStatus(status, pagination));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<MerchantResponseDTO>> search(
            @Valid @RequestBody MerchantFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Merchants fetched", service.searchMerchants(filter, pagination));
    }

    @GetMapping("/stats")
    public ApiResponse<MerchantStatsDTO> getStats() {
        return new ApiResponse<>("Merchant stats fetched", service.getMerchantStats());
    }

    @PutMapping("/{id:\\d+}")
    public ApiResponse<MerchantResponseDTO> update(@PathVariable Long id,
                                                   @Valid @RequestBody MerchantRequestDTO dto) {
        return new ApiResponse<>("Merchant updated", service.update(id, dto));
    }

    @DeleteMapping("/{id:\\d+}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return new ApiResponse<>("Merchant deleted", "OK");
    }

    @PatchMapping("/{id:\\d+}/status")
    public ApiResponse<MerchantResponseDTO> updateStatus(@PathVariable Long id,
                                                         @RequestParam Status newStatus) {
        return new ApiResponse<>("Status updated", service.updateStatus(id, newStatus));
    }
}
