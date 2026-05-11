package com.acquirerx.ops.reconciliation.service;

import com.acquirerx.ops.client.TransactionServiceClient;
import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.exception.ResourceNotFoundException;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.reconciliation.dto.ExceptionCaseResponseDTO;
import com.acquirerx.ops.reconciliation.dto.ReconFilterDTO;
import com.acquirerx.ops.reconciliation.dto.ReconFileRequestDTO;
import com.acquirerx.ops.reconciliation.dto.ReconFileResponseDTO;
import com.acquirerx.ops.reconciliation.dto.ReconItemInputDTO;
import com.acquirerx.ops.reconciliation.dto.ReconItemResponseDTO;
import com.acquirerx.ops.reconciliation.dto.ReconSummaryDTO;
import com.acquirerx.ops.reconciliation.dto.ResolveExceptionDTO;
import com.acquirerx.ops.reconciliation.entity.ExceptionCase;
import com.acquirerx.ops.reconciliation.entity.ReconFile;
import com.acquirerx.ops.reconciliation.entity.ReconItem;
import com.acquirerx.ops.reconciliation.repository.ExceptionCaseRepository;
import com.acquirerx.ops.reconciliation.repository.ReconFileRepository;
import com.acquirerx.ops.reconciliation.repository.ReconItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReconciliationService {

    private static final Set<String> FILE_SORT_FIELDS = Set.of(
            "reconFileId", "source", "status", "fileDate", "loadedAt"
    );
    private static final Set<String> ITEM_SORT_FIELDS = Set.of(
            "reconItemId", "amount", "matchStatus"
    );
    private static final Set<String> EXCEPTION_SORT_FIELDS = Set.of(
            "exceptionId", "category", "status", "createdAt"
    );

    private final ReconFileRepository reconFileRepository;
    private final ReconItemRepository reconItemRepository;
    private final ExceptionCaseRepository exceptionCaseRepository;
    private final TransactionServiceClient transactionClient;

    // ── LOAD AND RECONCILE ───────────────────
    public ReconFileResponseDTO loadAndReconcile(ReconFileRequestDTO dto) {
        ReconFile reconFile = new ReconFile();
        reconFile.setSource(dto.getSource());
        reconFile.setFileDate(dto.getFileDate());
        reconFile.setRowCount(dto.getItems().size());
        reconFile.setStatus("LOADED");

        ReconFile savedFile = reconFileRepository.save(reconFile);

        List<Map<String, Object>> systemTxns;
        try {
            Map<String, Object> resp = transactionClient.getAllTxns();
            Object dataObj = resp.get("data");
            if (dataObj instanceof List) {
                systemTxns = (List<Map<String, Object>>) dataObj;
            } else {
                systemTxns = List.of();
            }
        } catch (Exception e) {
            log.error("Cannot fetch txns from transaction-service: {}", e.getMessage());
            systemTxns = List.of();
        }

        int matched = 0;
        int mismatched = 0;
        int unmatched = 0;

        for (ReconItemInputDTO itemDto : dto.getItems()) {
            ReconItem item = new ReconItem();
            item.setReconFile(savedFile);
            item.setReference(itemDto.getReference());
            item.setAmount(itemDto.getAmount());

            Map<String, Object> matchedTxn = null;
            try {
                Long refId = Long.parseLong(itemDto.getReference());
                matchedTxn = systemTxns.stream()
                        .filter(t -> {
                            Object txnIdObj = t.get("txnId");
                            return txnIdObj != null && Long.valueOf(txnIdObj.toString()).equals(refId);
                        })
                        .findFirst()
                        .orElse(null);
            } catch (NumberFormatException e) {
                matchedTxn = null;
            }

            if (matchedTxn == null) {
                item.setMatchStatus("UNMATCHED");
                item.setNotes("Transaction not found in system");
                createException(itemDto.getReference(), "MISSING_TXN");
                unmatched++;
            } else {
                BigDecimal systemAmount = matchedTxn.get("amount") != null
                        ? new BigDecimal(matchedTxn.get("amount").toString()) : BigDecimal.ZERO;
                if (systemAmount.compareTo(itemDto.getAmount()) != 0) {
                    item.setMatchStatus("MISMATCHED");
                    item.setNotes("Amount mismatch: system=" + systemAmount
                            + ", external=" + itemDto.getAmount());
                    createException(itemDto.getReference(), "AMOUNT_MISMATCH");
                    mismatched++;
                } else {
                    item.setMatchStatus("MATCHED");
                    matched++;
                }
            }

            reconItemRepository.save(item);
        }

        savedFile.setStatus("PROCESSED");
        reconFileRepository.save(savedFile);

        log.info("Recon complete: file={}, matched={}, mismatched={}, unmatched={}",
                savedFile.getReconFileId(), matched, mismatched, unmatched);

        return toFileResponse(savedFile);
    }

    // ── GET ITEMS BY FILE ────────────────────
    public PagedResponseDTO<ReconItemResponseDTO> getItemsByFile(Long reconFileId, PaginationParams pagination) {
        ReconFile file = reconFileRepository.findById(reconFileId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recon file not found: " + reconFileId));

        pagination.validateSortField(ITEM_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ReconItem> itemPage = reconItemRepository.findByReconFile(file, pageable);
        Page<ReconItemResponseDTO> dtoPage = itemPage.map(this::toItemResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    // ── GET ALL EXCEPTIONS ───────────────────
    public PagedResponseDTO<ExceptionCaseResponseDTO> getAllExceptions(PaginationParams pagination) {
        pagination.validateSortField(EXCEPTION_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ExceptionCase> exPage = exceptionCaseRepository.findAll(pageable);
        Page<ExceptionCaseResponseDTO> dtoPage = exPage.map(this::toExceptionResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    // ── GET OPEN EXCEPTIONS ──────────────────
    public PagedResponseDTO<ExceptionCaseResponseDTO> getOpenExceptions(PaginationParams pagination) {
        pagination.validateSortField(EXCEPTION_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ExceptionCase> exPage = exceptionCaseRepository.findByStatus("OPEN", pageable);
        Page<ExceptionCaseResponseDTO> dtoPage = exPage.map(this::toExceptionResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    // ── RESOLVE EXCEPTION ────────────────────
    public ExceptionCaseResponseDTO resolveException(Long exceptionId, ResolveExceptionDTO dto) {
        ExceptionCase ex = exceptionCaseRepository.findById(exceptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exception not found: " + exceptionId));

        ex.setStatus(dto.getStatus());
        if (dto.getNotes() != null) {
            ex.setNotes(dto.getNotes());
        }

        ExceptionCase saved = exceptionCaseRepository.save(ex);
        log.info("Exception resolved: id={}, status={}", exceptionId, dto.getStatus());
        return toExceptionResponse(saved);
    }

    // ── GET ALL RECON FILES ──────────────────
    public PagedResponseDTO<ReconFileResponseDTO> getAllFiles(PaginationParams pagination) {
        pagination.validateSortField(FILE_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ReconFile> filePage = reconFileRepository.findAll(pageable);
        Page<ReconFileResponseDTO> dtoPage = filePage.map(this::toFileResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<ReconFileResponseDTO> searchFiles(ReconFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(FILE_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ReconFile> filePage = reconFileRepository.findByFiltersPaged(
            filter.getSource(),
            filter.getFileStatus(),
            filter.getFromDate(),
            filter.getToDate(),
            pageable
        );

        Page<ReconFileResponseDTO> dtoPage = filePage.map(this::toFileResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<ReconItemResponseDTO> searchItems(ReconFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(ITEM_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ReconItem> itemPage = reconItemRepository.findByFiltersPaged(
            filter.getMatchStatus(),
            filter.getReconFileId(),
            pageable
        );

        Page<ReconItemResponseDTO> dtoPage = itemPage.map(this::toItemResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<ExceptionCaseResponseDTO> searchExceptions(ReconFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(EXCEPTION_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<ExceptionCase> exPage = exceptionCaseRepository.findByFiltersPaged(
            filter.getCategory(),
            filter.getExceptionStatus(),
            pageable
        );

        Page<ExceptionCaseResponseDTO> dtoPage = exPage.map(this::toExceptionResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public ReconSummaryDTO getReconSummary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long totalFiles = reconFileRepository.count();
        long processedFiles = value(reconFileRepository.countByStatus("PROCESSED"));
        long failedFiles = value(reconFileRepository.countByStatus("FAILED"));
        long loadedFiles = value(reconFileRepository.countByStatus("LOADED"));

        long totalItems = reconItemRepository.count();
        long matched = value(reconItemRepository.countByMatchStatus("MATCHED"));
        long mismatched = value(reconItemRepository.countByMatchStatus("MISMATCHED"));
        long unmatched = value(reconItemRepository.countByMatchStatus("UNMATCHED"));

        double matchRate = totalItems > 0
            ? Math.round((matched * 100.0 / totalItems) * 100.0) / 100.0
            : 0.0;

        long totalExceptions = exceptionCaseRepository.count();
        long openExceptions = value(exceptionCaseRepository.countByStatus("OPEN"));
        long resolvedExceptions = value(exceptionCaseRepository.countByStatus("RESOLVED"));
        long writtenOff = value(exceptionCaseRepository.countByStatus("WRITTEN_OFF"));

        long filesLoadedToday = value(reconFileRepository.countLoadedAfter(todayStart));
        long exceptionsToday = value(exceptionCaseRepository.countCreatedAfter(todayStart));

        if (openExceptions > 0) {
            log.warn("Recon summary: {} open exceptions need attention!", openExceptions);
        }
        if (mismatched > 0) {
            log.warn("Recon summary: {} mismatched items need investigation!", mismatched);
        }

        log.info("Recon summary: files={}, matchRate={}%, openExceptions={}",
            totalFiles, matchRate, openExceptions);

        return new ReconSummaryDTO(
            totalFiles, processedFiles, failedFiles, loadedFiles,
            totalItems, matched, mismatched, unmatched,
            matchRate,
            totalExceptions, openExceptions, resolvedExceptions, writtenOff,
            filesLoadedToday, exceptionsToday
        );
    }

    private void createException(String referenceId, String category) {
        ExceptionCase ex = new ExceptionCase();
        ex.setReferenceId(referenceId);
        ex.setCategory(category);
        ex.setStatus("OPEN");
        exceptionCaseRepository.save(ex);
        log.warn("Exception created: ref={}, category={}", referenceId, category);
    }

    private ReconFileResponseDTO toFileResponse(ReconFile f) {
        ReconFileResponseDTO r = new ReconFileResponseDTO();
        r.setReconFileId(f.getReconFileId());
        r.setSource(f.getSource());
        r.setFileDate(f.getFileDate());
        r.setRowCount(f.getRowCount());
        r.setStatus(f.getStatus());
        r.setLoadedAt(f.getLoadedAt());
        return r;
    }

    private ReconItemResponseDTO toItemResponse(ReconItem i) {
        ReconItemResponseDTO r = new ReconItemResponseDTO();
        r.setReconItemId(i.getReconItemId());
        r.setReference(i.getReference());
        r.setAmount(i.getAmount());
        r.setMatchStatus(i.getMatchStatus());
        r.setNotes(i.getNotes());
        r.setReconFileId(i.getReconFile().getReconFileId());
        return r;
    }

    private ExceptionCaseResponseDTO toExceptionResponse(ExceptionCase e) {
        ExceptionCaseResponseDTO r = new ExceptionCaseResponseDTO();
        r.setExceptionId(e.getExceptionId());
        r.setReferenceId(e.getReferenceId());
        r.setCategory(e.getCategory());
        r.setStatus(e.getStatus());
        r.setNotes(e.getNotes());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    private long value(Long value) {
        return value == null ? 0L : value;
    }
}
