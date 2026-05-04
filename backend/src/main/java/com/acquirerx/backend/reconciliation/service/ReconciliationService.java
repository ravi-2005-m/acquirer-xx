package com.acquirerx.backend.reconciliation.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.reconciliation.dto.ExceptionCaseResponseDTO;
import com.acquirerx.backend.reconciliation.dto.ReconFilterDTO;
import com.acquirerx.backend.reconciliation.dto.ReconFileRequestDTO;
import com.acquirerx.backend.reconciliation.dto.ReconFileResponseDTO;
import com.acquirerx.backend.reconciliation.dto.ReconItemInputDTO;
import com.acquirerx.backend.reconciliation.dto.ReconItemResponseDTO;
import com.acquirerx.backend.reconciliation.dto.ReconSummaryDTO;
import com.acquirerx.backend.reconciliation.dto.ResolveExceptionDTO;
import com.acquirerx.backend.reconciliation.entity.ExceptionCase;
import com.acquirerx.backend.reconciliation.entity.ReconFile;
import com.acquirerx.backend.reconciliation.entity.ReconItem;
import com.acquirerx.backend.reconciliation.repository.ExceptionCaseRepository;
import com.acquirerx.backend.reconciliation.repository.ReconFileRepository;
import com.acquirerx.backend.reconciliation.repository.ReconItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReconciliationService {

    private final ReconFileRepository reconFileRepository;
    private final ReconItemRepository reconItemRepository;
    private final ExceptionCaseRepository exceptionCaseRepository;
    private final TxnRepository txnRepository;

    // ── LOAD AND RECONCILE ───────────────────
    public ReconFileResponseDTO loadAndReconcile(ReconFileRequestDTO dto) {
        ReconFile reconFile = new ReconFile();
        reconFile.setSource(dto.getSource());
        reconFile.setFileDate(dto.getFileDate());
        reconFile.setRowCount(dto.getItems().size());
        reconFile.setStatus("LOADED");

        ReconFile savedFile = reconFileRepository.save(reconFile);

        List<Txn> systemTxns = txnRepository.findAll();

        int matched = 0;
        int mismatched = 0;
        int unmatched = 0;

        for (ReconItemInputDTO itemDto : dto.getItems()) {
            ReconItem item = new ReconItem();
            item.setReconFile(savedFile);
            item.setReference(itemDto.getReference());
            item.setAmount(itemDto.getAmount());

            // FIX: parse reference as Long to compare with txnId (Long)
            Txn matchedTxn = null;
            try {
                Long refId = Long.parseLong(itemDto.getReference());
                matchedTxn = systemTxns.stream()
                        .filter(t -> t.getTxnId().equals(refId))
                        .findFirst()
                        .orElse(null);
            } catch (NumberFormatException e) {
                // reference is not a number — will be UNMATCHED
                matchedTxn = null;
            }

            if (matchedTxn == null) {
                item.setMatchStatus("UNMATCHED");
                item.setNotes("Transaction not found in system");
                createException(itemDto.getReference(), "MISSING_TXN");
                unmatched++;
            } else if (!matchedTxn.getAmount().equals(itemDto.getAmount())) {
                item.setMatchStatus("MISMATCHED");
                item.setNotes("Amount mismatch: system=" + matchedTxn.getAmount()
                        + ", external=" + itemDto.getAmount());
                createException(itemDto.getReference(), "AMOUNT_MISMATCH");
                mismatched++;
            } else {
                item.setMatchStatus("MATCHED");
                matched++;
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
        public PagedResponseDTO<ReconItemResponseDTO> getItemsByFile(
            Long reconFileId, int page, int size) {

        ReconFile file = reconFileRepository.findById(reconFileId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recon file not found: " + reconFileId));

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.ASC, "reconItemId")
        );

        Page<ReconItem> itemPage = reconItemRepository.findByReconFile(file, pageRequest);
        Page<ReconItemResponseDTO> dtoPage = itemPage.map(this::toItemResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    // ── GET ALL EXCEPTIONS ───────────────────
        public PagedResponseDTO<ExceptionCaseResponseDTO> getAllExceptions(
            int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<ExceptionCase> exPage = exceptionCaseRepository.findAll(pageRequest);
        Page<ExceptionCaseResponseDTO> dtoPage = exPage.map(this::toExceptionResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    // ── GET OPEN EXCEPTIONS ──────────────────
        public PagedResponseDTO<ExceptionCaseResponseDTO> getOpenExceptions(
            int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<ExceptionCase> exPage = exceptionCaseRepository.findByStatus("OPEN", pageRequest);
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
        public PagedResponseDTO<ReconFileResponseDTO> getAllFiles(
            int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "loadedAt")
        );

        Page<ReconFile> filePage = reconFileRepository.findAll(pageRequest);
        Page<ReconFileResponseDTO> dtoPage = filePage.map(this::toFileResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<ReconFileResponseDTO> searchFiles(
            ReconFilterDTO filter, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "loadedAt")
        );

        Page<ReconFile> filePage = reconFileRepository.findByFiltersPaged(
            filter.getSource(),
            filter.getFileStatus(),
            filter.getFromDate(),
            filter.getToDate(),
            pageRequest
        );

        Page<ReconFileResponseDTO> dtoPage = filePage.map(this::toFileResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<ReconItemResponseDTO> searchItems(
            ReconFilterDTO filter, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.ASC, "reconItemId")
        );

        Page<ReconItem> itemPage = reconItemRepository.findByFiltersPaged(
            filter.getMatchStatus(),
            filter.getReconFileId(),
            pageRequest
        );

        Page<ReconItemResponseDTO> dtoPage = itemPage.map(this::toItemResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<ExceptionCaseResponseDTO> searchExceptions(
            ReconFilterDTO filter, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<ExceptionCase> exPage = exceptionCaseRepository.findByFiltersPaged(
            filter.getCategory(),
            filter.getExceptionStatus(),
            pageRequest
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
