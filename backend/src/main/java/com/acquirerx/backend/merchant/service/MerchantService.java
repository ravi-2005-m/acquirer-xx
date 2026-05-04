package com.acquirerx.backend.merchant.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.enums.RiskLevel;
import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.merchant.dto.MerchantFilterDTO;
import com.acquirerx.backend.merchant.dto.MerchantRequestDTO;
import com.acquirerx.backend.merchant.dto.MerchantResponseDTO;
import com.acquirerx.backend.merchant.dto.MerchantStatsDTO;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.repository.MerchantRepository;
import com.acquirerx.backend.store.repository.StoreRepository;
import com.acquirerx.backend.terminal.repository.TerminalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository repository;
    private final StoreRepository storeRepository;
    private final TerminalRepository terminalRepository;

    public MerchantResponseDTO create(MerchantRequestDTO dto) {
        if (repository.existsByLegalName(dto.getLegalName())) {
            throw new IllegalArgumentException("Merchant with this legal name already exists");
        }

        Merchant merchant = new Merchant();
        merchant.setLegalName(dto.getLegalName());
        merchant.setDoingBusinessAs(dto.getDoingBusinessAs());
        merchant.setMcc(dto.getMcc());
        merchant.setContactInfo(dto.getContactInfo());
        merchant.setStatus(Status.ACTIVE);
        merchant.setRiskLevel(dto.getRiskLevel() != null ? dto.getRiskLevel() : RiskLevel.LOW);

        Merchant saved = repository.save(merchant);
        log.info("Merchant created: id={}, name={}", saved.getMerchantId(), saved.getLegalName());
        return toResponse(saved);
    }

    public PagedResponseDTO<MerchantResponseDTO> getAll(
            int page, int size, String sortBy) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.ASC, sortBy)
        );

        Page<Merchant> merchantPage = repository.findAll(pageRequest);
        Page<MerchantResponseDTO> dtoPage = merchantPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public MerchantResponseDTO getMerchantById(Long merchantId) {
        return toResponse(getEntityById(merchantId));
    }

    public PagedResponseDTO<MerchantResponseDTO> getByStatus(
            Status status, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.ASC, "legalName")
        );

        Page<Merchant> merchantPage = repository.findByStatus(status, pageRequest);
        Page<MerchantResponseDTO> dtoPage = merchantPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<MerchantResponseDTO> searchMerchants(
            MerchantFilterDTO filter, int page, int size) {

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

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.ASC, "legalName")
        );

        Page<Merchant> merchantPage = repository.findByFiltersPaged(
                filter.getLegalName(),
                filter.getMcc(),
                statusEnum,
                riskLevelEnum,
                filter.getContactInfo(),
                pageRequest
        );

        log.info("Merchant search: filters={}, total={}",
                filter, merchantPage.getTotalElements());

        Page<MerchantResponseDTO> dtoPage = merchantPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public MerchantStatsDTO getMerchantStats() {
        long total = repository.count();
        long active = repository.countByStatus(Status.ACTIVE);
        long inactive = repository.countByStatus(Status.INACTIVE);
        long pending = repository.countByStatus(Status.PENDING);

        long low = repository.countByRiskLevel(RiskLevel.LOW);
        long medium = repository.countByRiskLevel(RiskLevel.MEDIUM);
        long high = repository.countByRiskLevel(RiskLevel.HIGH);
        long critical = repository.countByRiskLevel(RiskLevel.CRITICAL);

        long totalStores = storeRepository.count();
        long totalTerminals = terminalRepository.count();

        log.info("Merchant stats: total={}, active={}, stores={}, terminals={}",
                total, active, totalStores, totalTerminals);

        return new MerchantStatsDTO(
                total, active, inactive, pending,
                low, medium, high, critical,
                totalStores, totalTerminals
        );
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
