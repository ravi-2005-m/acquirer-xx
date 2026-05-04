package com.acquirerx.merchant.store.controller;

import com.acquirerx.merchant.common.dto.PagedResponseDTO;
import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.common.response.ApiResponse;
import com.acquirerx.merchant.store.dto.StoreFilterDTO;
import com.acquirerx.merchant.store.dto.StoreRequestDTO;
import com.acquirerx.merchant.store.dto.StoreResponseDTO;
import com.acquirerx.merchant.store.dto.StoreStatsDTO;
import com.acquirerx.merchant.store.service.StoreService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "3. Stores")
public class StoreController {

    private final StoreService service;

    @PostMapping("/merchants/{merchantId:\\d+}/stores")
    public ApiResponse<StoreResponseDTO> create(@PathVariable Long merchantId,
                                                @Valid @RequestBody StoreRequestDTO dto) {
        return new ApiResponse<>("Store created", service.create(merchantId, dto));
    }

    @GetMapping("/merchants/{merchantId:\\d+}/stores")
    public ApiResponse<PagedResponseDTO<StoreResponseDTO>> getByMerchant(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Stores fetched", service.getByMerchant(merchantId, page, size));
    }

    @GetMapping("/stores")
    public ApiResponse<PagedResponseDTO<StoreResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "storeName") String sortBy) {
        return new ApiResponse<>("Stores fetched", service.getAll(page, size, sortBy));
    }

    @PostMapping("/stores/search")
    public ApiResponse<PagedResponseDTO<StoreResponseDTO>> search(
            @Valid @RequestBody StoreFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Stores fetched", service.searchStores(filter, page, size));
    }

    @GetMapping("/stores/stats")
    public ApiResponse<StoreStatsDTO> getStats() {
        return new ApiResponse<>("Store stats fetched", service.getStoreStats());
    }

    @GetMapping("/stores/{id:\\d+}")
    public ApiResponse<StoreResponseDTO> getById(@PathVariable Long id) {
        return new ApiResponse<>("Store fetched", service.getStoreById(id));
    }

    @PutMapping("/stores/{id:\\d+}")
    public ApiResponse<StoreResponseDTO> update(@PathVariable Long id,
                                                @Valid @RequestBody StoreRequestDTO dto) {
        return new ApiResponse<>("Store updated", service.update(id, dto));
    }

    @DeleteMapping("/stores/{id:\\d+}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return new ApiResponse<>("Store deleted", "OK");
    }

    @PatchMapping("/stores/{id:\\d+}/status")
    public ApiResponse<StoreResponseDTO> updateStatus(@PathVariable Long id,
                                                      @RequestParam Status newStatus) {
        return new ApiResponse<>("Status updated", service.updateStatus(id, newStatus));
    }
}
