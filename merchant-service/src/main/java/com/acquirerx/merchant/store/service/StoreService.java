package com.acquirerx.merchant.store.service;

import com.acquirerx.merchant.common.dto.PagedResponseDTO;
import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.common.exception.ResourceNotFoundException;
import com.acquirerx.merchant.merchant.entity.Merchant;
import com.acquirerx.merchant.merchant.service.MerchantService;
import com.acquirerx.merchant.store.dto.StoreFilterDTO;
import com.acquirerx.merchant.store.dto.StoreRequestDTO;
import com.acquirerx.merchant.store.dto.StoreResponseDTO;
import com.acquirerx.merchant.store.dto.StoreStatsDTO;
import com.acquirerx.merchant.store.entity.Store;
import com.acquirerx.merchant.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final MerchantService merchantService;

    public StoreResponseDTO create(Long merchantId, StoreRequestDTO dto) {
        Merchant merchant = merchantService.getEntityById(merchantId);

        if (merchant.getStatus() != Status.ACTIVE) {
            throw new IllegalStateException(
                "Cannot create store: merchant is " + merchant.getStatus());
        }

        Store store = new Store();
        store.setStoreName(dto.getStoreName());
        store.setAddress(dto.getAddress());
        store.setRegion(dto.getRegion());
        store.setCity(dto.getCity());
        store.setState(dto.getState());
        store.setPincode(dto.getPincode());
        store.setContactPerson(dto.getContactPerson());
        store.setContactPhone(dto.getContactPhone());
        store.setMerchant(merchant);
        store.setStatus(Status.ACTIVE);

        Store saved = storeRepository.save(store);
        log.info("Store created: id={}, merchant={}", saved.getStoreId(), merchantId);
        return toResponse(saved);
    }

    public PagedResponseDTO<StoreResponseDTO> getAll(
            int page, int size, String sortBy) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.ASC, sortBy)
        );

        Page<Store> storePage = storeRepository.findAll(pageRequest);
        Page<StoreResponseDTO> dtoPage = storePage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public StoreResponseDTO getStoreById(Long storeId) {
        return toResponse(getEntityById(storeId));
    }

        public PagedResponseDTO<StoreResponseDTO> getByMerchant(
            Long merchantId, int page, int size) {

        Merchant merchant = merchantService.getEntityById(merchantId);

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.ASC, "storeName")
        );

        Page<Store> storePage = storeRepository.findByMerchant(merchant, pageRequest);
        Page<StoreResponseDTO> dtoPage = storePage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<StoreResponseDTO> searchStores(
            StoreFilterDTO filter, int page, int size) {

        Status statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
            statusEnum = Status.valueOf(filter.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + filter.getStatus());
            }
        }

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.ASC, "storeName")
        );

        Page<Store> storePage = storeRepository.findByFiltersPaged(
            filter.getStoreName(),
            filter.getRegion(),
            filter.getAddress(),
            statusEnum,
            filter.getMerchantId(),
            pageRequest
        );

        log.info("Store search: filters={}, total={}",
            filter, storePage.getTotalElements());

        Page<StoreResponseDTO> dtoPage = storePage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public StoreStatsDTO getStoreStats() {
        long total = storeRepository.count();
        long active = storeRepository.countByStatus(Status.ACTIVE);
        long inactive = storeRepository.countByStatus(Status.INACTIVE);

        long totalTerminals = 0L;
        long uniqueRegions = storeRepository.countDistinctRegions();

        double avgTerminals = total > 0
            ? Math.round((totalTerminals * 100.0 / total)) / 100.0
            : 0.0;

        log.info("Store stats: total={}, active={}, terminals={}, regions={}",
            total, active, totalTerminals, uniqueRegions);

        return new StoreStatsDTO(
            total, active, inactive,
            totalTerminals, avgTerminals,
            uniqueRegions
        );
    }

    public StoreResponseDTO update(Long storeId, StoreRequestDTO dto) {
        Store store = getEntityById(storeId);
        store.setStoreName(dto.getStoreName());
        store.setAddress(dto.getAddress());
        store.setRegion(dto.getRegion());
        store.setCity(dto.getCity());
        store.setState(dto.getState());
        store.setPincode(dto.getPincode());
        store.setContactPerson(dto.getContactPerson());
        store.setContactPhone(dto.getContactPhone());
        Store updated = storeRepository.save(store);
        log.info("Store updated: id={}", storeId);
        return toResponse(updated);
    }

    public void delete(Long storeId) {
        Store store = getEntityById(storeId);
        storeRepository.delete(store);
        log.info("Store deleted: id={}", storeId);
    }

    public StoreResponseDTO updateStatus(Long storeId, Status newStatus) {
        Store store = getEntityById(storeId);
        store.setStatus(newStatus);
        Store updated = storeRepository.save(store);
        log.info("Store status updated: id={}, status={}", storeId, newStatus);
        return toResponse(updated);
    }

    public Store getEntityById(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
    }

    private StoreResponseDTO toResponse(Store store) {
        StoreResponseDTO response = new StoreResponseDTO();
        response.setStoreId(store.getStoreId());
        response.setStoreName(store.getStoreName());
        response.setAddress(store.getAddress());
        response.setRegion(store.getRegion());
        response.setCity(store.getCity());
        response.setState(store.getState());
        response.setPincode(store.getPincode());
        response.setContactPerson(store.getContactPerson());
        response.setContactPhone(store.getContactPhone());
        response.setStatus(store.getStatus() != null ? store.getStatus().name() : null);
        response.setCreatedAt(store.getCreatedAt());

        if (store.getMerchant() != null) {
            response.setMerchantId(store.getMerchant().getMerchantId());
            response.setMerchantName(store.getMerchant().getLegalName());
        }

        return response;
    }
}
