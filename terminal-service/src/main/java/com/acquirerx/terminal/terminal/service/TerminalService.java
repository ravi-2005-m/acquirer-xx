package com.acquirerx.terminal.terminal.service;

import com.acquirerx.terminal.common.dto.PagedResponseDTO;
import com.acquirerx.terminal.common.enums.Status;
import com.acquirerx.terminal.common.exception.ResourceNotFoundException;
import com.acquirerx.terminal.common.pagination.PaginationParams;
import com.acquirerx.terminal.client.MerchantServiceClient;
import com.acquirerx.terminal.terminal.dto.TerminalFilterDTO;
import com.acquirerx.terminal.terminal.dto.TerminalRequestDTO;
import com.acquirerx.terminal.terminal.dto.TerminalResponseDTO;
import com.acquirerx.terminal.terminal.dto.TerminalStatsDTO;
import com.acquirerx.terminal.terminal.entity.Terminal;
import com.acquirerx.terminal.terminal.repository.TerminalHealthRepository;
import com.acquirerx.terminal.terminal.repository.TerminalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerminalService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "terminalId", "tid", "status", "storeId", "merchantId", "createdAt"
    );

    private final TerminalRepository terminalRepository;
    private final TerminalHealthRepository healthRepository;
    private final MerchantServiceClient merchantServiceClient;

    /**
     * Cross-service responses are wrapped in {@code ApiResponse{message, data}}.
     * This helper unwraps the {@code data} envelope so callers can read the
     * actual entity fields directly. If the response isn't wrapped (e.g. the
     * Feign client returned raw JSON), the original map is returned as-is.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> unwrapApiResponse(Map<String, Object> response) {
        if (response == null) return null;
        Object data = response.get("data");
        if (data instanceof Map) {
            return (Map<String, Object>) data;
        }
        return response;
    }

    public TerminalResponseDTO create(Long storeId, TerminalRequestDTO dto) {
        if (terminalRepository.existsByTid(dto.getTid())) {
            throw new IllegalArgumentException("Terminal with TID " + dto.getTid() + " already exists");
        }

        // Call Feign client to verify store exists and get merchant info
        Map<String, Object> storeResponse;
        try {
            storeResponse = unwrapApiResponse(merchantServiceClient.getStoreById(storeId));
        } catch (Exception e) {
            log.warn("Failed to verify store {} with merchant-service: {}", storeId, e.getMessage());
            throw new ResourceNotFoundException("Store not found or merchant-service unavailable");
        }

        if (storeResponse == null || storeResponse.isEmpty()) {
            throw new ResourceNotFoundException("Store not found: " + storeId);
        }

        Terminal terminal = new Terminal();
        terminal.setTid(dto.getTid());
        terminal.setBrandModel(dto.getBrandModel());
        terminal.setCapability(dto.getCapability());
        terminal.setStoreId(storeId);

        // Extract merchantId from the unwrapped store payload and verify merchant is ACTIVE
        Object merchantIdObj = storeResponse.get("merchantId");
        if (merchantIdObj != null) {
            Long mId = ((Number) merchantIdObj).longValue();
            terminal.setMerchantId(mId);
            try {
                Map<String, Object> merchantResp = unwrapApiResponse(merchantServiceClient.getMerchantById(mId));
                Object merchantStatus = merchantResp != null ? merchantResp.get("status") : null;
                if (merchantStatus != null && !"ACTIVE".equals(merchantStatus.toString())) {
                    throw new IllegalStateException(
                        "Cannot create terminal: merchant is " + merchantStatus);
                }
            } catch (IllegalStateException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Could not verify merchant status for merchantId={}: {}", mId, e.getMessage());
            }
        }

        terminal.setStatus(Status.ACTIVE);

        Terminal saved = terminalRepository.save(terminal);
        log.info("Terminal created: id={}, tid={}, store={}, merchant={}",
                 saved.getTerminalId(), saved.getTid(), storeId, terminal.getMerchantId());
        return toResponse(saved);
    }

    public PagedResponseDTO<TerminalResponseDTO> getAll(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Terminal> terminalPage = terminalRepository.findAll(pageable);
        Page<TerminalResponseDTO> dtoPage = terminalPage.map(this::toResponseWithFeignLookup);
        return new PagedResponseDTO<>(dtoPage);
    }

    public TerminalResponseDTO getTerminalById(Long terminalId) {
        // Use the Feign-enriched mapper so the detail page shows the
        // resolved store and merchant names (matches list/search behaviour).
        return toResponseWithFeignLookup(getEntityById(terminalId));
    }

    public PagedResponseDTO<TerminalResponseDTO> getByStore(Long storeId, PaginationParams pagination) {

        // Verify store exists via Feign client
        try {
            merchantServiceClient.getStoreById(storeId);
        } catch (Exception e) {
            log.warn("Failed to verify store {}: {}", storeId, e.getMessage());
            throw new ResourceNotFoundException("Store not found or merchant-service unavailable");
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Terminal> terminalPage = terminalRepository.findByStoreId(storeId, pageable);
        Page<TerminalResponseDTO> dtoPage = terminalPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<TerminalResponseDTO> searchTerminals(TerminalFilterDTO filter, PaginationParams pagination) {

        Status statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                statusEnum = Status.valueOf(filter.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + filter.getStatus());
            }
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Terminal> terminalPage = terminalRepository.findByFiltersPaged(
                filter.getTid(),
                filter.getBrandModel(),
                filter.getCapability(),
                statusEnum,
                filter.getStoreId(),
                filter.getMerchantId(),
                pageable
        );

        log.info("Terminal search: filters={}, total={}", filter, terminalPage.getTotalElements());

        Page<TerminalResponseDTO> dtoPage = terminalPage.map(this::toResponseWithFeignLookup);
        return new PagedResponseDTO<>(dtoPage);
    }

    public TerminalStatsDTO getTerminalStats() {
        long total = terminalRepository.count();
        long active = terminalRepository.countByStatus(Status.ACTIVE);
        long inactive = terminalRepository.countByStatus(Status.INACTIVE);

        long emv = terminalRepository.countByCapabilityIgnoreCase("EMV");
        long contactless = terminalRepository.countByCapabilityIgnoreCase("CTLS");
        long magstripe = terminalRepository.countByCapabilityIgnoreCase("MAGSTRIPE");

        long verifone = terminalRepository.countByBrandContaining("verifone");
        long ingenico = terminalRepository.countByBrandContaining("ingenico");
        long other = total - verifone - ingenico;

        log.info("Terminal stats: total={}, active={}, verifone={}, ingenico={}, other={}",
                total, active, verifone, ingenico, other);

        return new TerminalStatsDTO(
                total, active, inactive,
                emv, contactless, magstripe,
                verifone, ingenico, other,
                0L, 0L  // Terminal-service doesn't track batches; these would be 0
        );
    }

    public TerminalResponseDTO update(Long terminalId, TerminalRequestDTO dto) {
        Terminal terminal = getEntityById(terminalId);
        terminal.setBrandModel(dto.getBrandModel());
        terminal.setCapability(dto.getCapability());
        Terminal updated = terminalRepository.save(terminal);
        log.info("Terminal updated: id={}", terminalId);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long terminalId) {
        Terminal terminal = getEntityById(terminalId);
        healthRepository.findByTerminal(terminal).ifPresent(healthRepository::delete);
        terminalRepository.delete(terminal);
        log.info("Terminal deleted: id={}", terminalId);
    }

    public TerminalResponseDTO updateStatus(Long terminalId, Status newStatus) {
        Terminal terminal = getEntityById(terminalId);
        terminal.setStatus(newStatus);
        Terminal updated = terminalRepository.save(terminal);
        log.info("Terminal status updated: id={}, status={}", terminalId, newStatus);
        return toResponse(updated);
    }

    public Terminal getEntityById(Long terminalId) {
        return terminalRepository.findById(terminalId)
                .orElseThrow(() -> new ResourceNotFoundException("Terminal not found with id: " + terminalId));
    }

    private TerminalResponseDTO toResponse(Terminal terminal) {
        TerminalResponseDTO response = new TerminalResponseDTO();
        response.setTerminalId(terminal.getTerminalId());
        response.setTid(terminal.getTid());
        response.setBrandModel(terminal.getBrandModel());
        response.setCapability(terminal.getCapability());
        response.setStatus(terminal.getStatus() != null ? terminal.getStatus().name() : null);
        response.setStoreId(terminal.getStoreId());
        response.setMerchantId(terminal.getMerchantId());
        response.setCreatedAt(terminal.getCreatedAt());

        if (terminal.getParamProfile() != null) {
            response.setParamProfileId(terminal.getParamProfile().getParamProfileId());
            response.setParamProfileName(terminal.getParamProfile().getName());
            response.setParamsJson(terminal.getParamProfile().getParamsJson());
        }

        return response;
    }

    private TerminalResponseDTO toResponseWithFeignLookup(Terminal terminal) {
        TerminalResponseDTO response = toResponse(terminal);

        // Try to enrich with store/merchant names via Feign (non-blocking on failure)
        if (terminal.getStoreId() != null) {
            try {
                Map<String, Object> storeResponse =
                        unwrapApiResponse(merchantServiceClient.getStoreById(terminal.getStoreId()));
                if (storeResponse != null) {
                    response.setStoreName((String) storeResponse.get("storeName"));
                    Object merchantIdObj = storeResponse.get("merchantId");
                    if (merchantIdObj != null) {
                        Long merchantId = ((Number) merchantIdObj).longValue();
                        try {
                            Map<String, Object> merchantResponse =
                                    unwrapApiResponse(merchantServiceClient.getMerchantById(merchantId));
                            if (merchantResponse != null) {
                                response.setMerchantName((String) merchantResponse.get("legalName"));
                            }
                        } catch (Exception e) {
                            log.debug("Failed to lookup merchant {}: {}", merchantId, e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Failed to lookup store {}: {}", terminal.getStoreId(), e.getMessage());
            }
        }

        return response;
    }
}
