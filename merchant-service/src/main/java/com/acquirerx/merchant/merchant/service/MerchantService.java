package com.acquirerx.merchant.merchant.service;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.acquirerx.merchant.common.dto.PagedResponseDTO;
import com.acquirerx.merchant.common.enums.RiskLevel;
import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.common.exception.ResourceNotFoundException;
import com.acquirerx.merchant.common.pagination.PaginationParams;
import com.acquirerx.merchant.merchant.dto.MerchantFilterDTO;
import com.acquirerx.merchant.merchant.dto.MerchantRequestDTO;
import com.acquirerx.merchant.merchant.dto.MerchantResponseDTO;
import com.acquirerx.merchant.merchant.dto.MerchantStatsDTO;
import com.acquirerx.merchant.merchant.entity.Merchant;
import com.acquirerx.merchant.merchant.repository.MerchantRepository;
import com.acquirerx.merchant.store.repository.StoreRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "merchantId", "legalName", "doingBusinessAs", "mcc", "status", "riskLevel", "createdAt"
    );

    private final MerchantRepository repository;
    private final StoreRepository storeRepository;

    public MerchantResponseDTO create(MerchantRequestDTO dto) {
        if (repository.existsByLegalName(dto.getLegalName())) {
            throw new IllegalArgumentException("Merchant with this legal name already exists");
        }

        Merchant merchant = new Merchant();
        merchant.setLegalName(dto.getLegalName());
        merchant.setDoingBusinessAs(dto.getDoingBusinessAs());
        merchant.setMcc(dto.getMcc());
        merchant.setContactInfo(dto.getContactInfo());
        merchant.setStatus(Status.PENDING);
        merchant.setRiskLevel(dto.getRiskLevel() != null ? dto.getRiskLevel() : RiskLevel.LOW);

        Merchant saved = repository.save(merchant);
        log.info("Merchant created: id={}, name={}", saved.getMerchantId(), saved.getLegalName());
        return toResponse(saved);
    }

    public PagedResponseDTO<MerchantResponseDTO> getAll(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Merchant> merchantPage = repository.findAll(pageable);
        Page<MerchantResponseDTO> dtoPage = merchantPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public MerchantResponseDTO getMerchantById(Long merchantId) {
        return toResponse(getEntityById(merchantId));
    }

    public PagedResponseDTO<MerchantResponseDTO> getByStatus(Status status, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Merchant> merchantPage = repository.findByStatus(status, pageable);
        Page<MerchantResponseDTO> dtoPage = merchantPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<MerchantResponseDTO> searchMerchants(MerchantFilterDTO filter, PaginationParams pagination) {

        Status statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                statusEnum = Status.valueOf(filter.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + filter.getStatus());
            }
        }

        RiskLevel riskLevelEnum = null;
        if (filter.getRiskLevel() != null && !filter.getRiskLevel().isBlank()) {
            try {
                riskLevelEnum = RiskLevel.valueOf(filter.getRiskLevel().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid riskLevel: " + filter.getRiskLevel());
            }
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Merchant> merchantPage = repository.findByFiltersPaged(
                filter.getLegalName(),
                filter.getMcc(),
                statusEnum,
                riskLevelEnum,
                filter.getContactInfo(),
                pageable
        );

        log.info("Merchant search: filters={}, total={}", filter, merchantPage.getTotalElements());

        Page<MerchantResponseDTO> dtoPage = merchantPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public MerchantStatsDTO getMerchantStats() {
        long total    = nz(repository.count());
        long active   = nz(repository.countByStatus(Status.ACTIVE));
        long inactive = nz(repository.countByStatus(Status.INACTIVE));
        long pending  = nz(repository.countByStatus(Status.PENDING));

        long low      = nz(repository.countByRiskLevel(RiskLevel.LOW));
        long medium   = nz(repository.countByRiskLevel(RiskLevel.MEDIUM));
        long high     = nz(repository.countByRiskLevel(RiskLevel.HIGH));
        long critical = nz(repository.countByRiskLevel(RiskLevel.CRITICAL));

        long totalStores = nz(storeRepository.count());
        long totalTerminals = 0L;

        log.info("Merchant stats: total={}, active={}, stores={}, terminals={}",
                total, active, totalStores, totalTerminals);

        return new MerchantStatsDTO(
                total, active, inactive, pending,
                low, medium, high, critical,
                totalStores, totalTerminals
        );
    }

    private static long nz(Long value) {
        return value == null ? 0L : value;
    }

    public MerchantResponseDTO update(Long merchantId, MerchantRequestDTO dto) {
        Merchant merchant = getEntityById(merchantId);
        if (!merchant.getLegalName().equals(dto.getLegalName()) &&
                repository.existsByLegalName(dto.getLegalName())) {
            throw new IllegalArgumentException("Merchant with this legal name already exists");
        }
        merchant.setLegalName(dto.getLegalName());
        merchant.setDoingBusinessAs(dto.getDoingBusinessAs());
        merchant.setMcc(dto.getMcc());
        merchant.setContactInfo(dto.getContactInfo());
        if (dto.getRiskLevel() != null) {
            merchant.setRiskLevel(dto.getRiskLevel());
        }
        Merchant updated = repository.save(merchant);
        log.info("Merchant updated: id={}, name={}", updated.getMerchantId(), updated.getLegalName());
        return toResponse(updated);
    }

    public void delete(Long merchantId) {
        Merchant merchant = getEntityById(merchantId);
        repository.delete(merchant);
        log.info("Merchant deleted: id={}", merchantId);
    }

    public MerchantResponseDTO updateStatus(Long merchantId, Status newStatus) {
        Merchant merchant = getEntityById(merchantId);
        merchant.setStatus(newStatus);
        Merchant updated = repository.save(merchant);
        log.info("Merchant status updated: id={}, status={}", merchantId, newStatus);
        return toResponse(updated);
    }

    public Merchant getEntityById(Long merchantId) {
        return repository.findById(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found with id: " + merchantId));
    }

    public Merchant getById(Long merchantId) {
        return getEntityById(merchantId);
    }

    private MerchantResponseDTO toResponse(Merchant merchant) {
        MerchantResponseDTO response = new MerchantResponseDTO();
        response.setMerchantId(merchant.getMerchantId());
        response.setLegalName(merchant.getLegalName());
        response.setDoingBusinessAs(merchant.getDoingBusinessAs());
        response.setMcc(merchant.getMcc());
        response.setContactInfo(merchant.getContactInfo());
        response.setRiskLevel(merchant.getRiskLevel() != null ? merchant.getRiskLevel().name() : null);
        response.setStatus(merchant.getStatus() != null ? merchant.getStatus().name() : null);
        response.setCreatedAt(merchant.getCreatedAt());
        return response;
    }
}