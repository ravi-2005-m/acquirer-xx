package com.acquirerx.backend.terminal.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.store.entity.Store;
import com.acquirerx.backend.store.service.StoreService;
import com.acquirerx.backend.terminal.dto.TerminalFilterDTO;
import com.acquirerx.backend.terminal.dto.TerminalRequestDTO;
import com.acquirerx.backend.terminal.dto.TerminalResponseDTO;
import com.acquirerx.backend.terminal.dto.TerminalStatsDTO;
import com.acquirerx.backend.terminal.entity.Terminal;
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
public class TerminalService {

    private final TerminalRepository terminalRepository;
    private final StoreService storeService;

    public TerminalResponseDTO create(Long storeId, TerminalRequestDTO dto) {
        if (terminalRepository.existsByTid(dto.getTid())) {
            throw new IllegalArgumentException("Terminal with TID " + dto.getTid() + " already exists");
        }

        Store store = storeService.getEntityById(storeId);

        Terminal terminal = new Terminal();
        terminal.setTid(dto.getTid());
        terminal.setBrandModel(dto.getBrandModel());
        terminal.setCapability(dto.getCapability());
        terminal.setStore(store);
        terminal.setStatus(Status.ACTIVE);

        Terminal saved = terminalRepository.save(terminal);
        log.info("Terminal created: id={}, tid={}, store={}", saved.getTerminalId(), saved.getTid(), storeId);
        return toResponse(saved);
    }

    public PagedResponseDTO<TerminalResponseDTO> getAll(
            int page, int size, String sortBy) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.ASC, sortBy)
        );

        Page<Terminal> terminalPage = terminalRepository.findAll(pageRequest);
        Page<TerminalResponseDTO> dtoPage = terminalPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public TerminalResponseDTO getTerminalById(Long terminalId) {
        return toResponse(getEntityById(terminalId));
    }

        public PagedResponseDTO<TerminalResponseDTO> getByStore(
            Long storeId, int page, int size) {

        Store store = storeService.getEntityById(storeId);

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.ASC, "tid")
        );

        Page<Terminal> terminalPage = terminalRepository.findByStore(store, pageRequest);
        Page<TerminalResponseDTO> dtoPage = terminalPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<TerminalResponseDTO> searchTerminals(
            TerminalFilterDTO filter, int page, int size) {

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
            Sort.by(Sort.Direction.ASC, "tid")
        );

        Page<Terminal> terminalPage = terminalRepository.findByFiltersPaged(
            filter.getTid(),
            filter.getBrandModel(),
            filter.getCapability(),
            statusEnum,
            filter.getStoreId(),
            filter.getMerchantId(),
            pageRequest
        );

        log.info("Terminal search: filters={}, total={}",
            filter, terminalPage.getTotalElements());

        Page<TerminalResponseDTO> dtoPage = terminalPage.map(this::toResponse);
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

        long openBatch = terminalRepository.countTerminalsWithOpenBatch();
        long noBatch = terminalRepository.countTerminalsWithNoBatch();

        log.info("Terminal stats: total={}, active={}, openBatch={}, noBatch={}",
            total, active, openBatch, noBatch);

        return new TerminalStatsDTO(
            total, active, inactive,
            emv, contactless, magstripe,
            verifone, ingenico, other,
            openBatch, noBatch
        );
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
        response.setCreatedAt(terminal.getCreatedAt());

        if (terminal.getStore() != null) {
            response.setStoreId(terminal.getStore().getStoreId());
            response.setStoreName(terminal.getStore().getStoreName());

            if (terminal.getStore().getMerchant() != null) {
                response.setMerchantId(terminal.getStore().getMerchant().getMerchantId());
                response.setMerchantName(terminal.getStore().getMerchant().getLegalName());
            }
        }

        if (terminal.getParamProfile() != null) {
            response.setParamProfileId(terminal.getParamProfile().getParamProfileId());
            response.setParamProfileName(terminal.getParamProfile().getName());
        }

        return response;
    }
}
