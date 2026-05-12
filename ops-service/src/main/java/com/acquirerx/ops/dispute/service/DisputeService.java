package com.acquirerx.ops.dispute.service;

import com.acquirerx.ops.client.TransactionServiceClient;
import com.acquirerx.ops.common.NotificationCategory;
import com.acquirerx.ops.notification.service.NotificationService;
import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.DisputeStage;
import com.acquirerx.ops.common.DisputeStatus;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.common.util.MaskingUtil;
import com.acquirerx.ops.dispute.dto.AddDocumentRequestDTO;
import com.acquirerx.ops.dispute.dto.DisputeActionRequestDTO;
import com.acquirerx.ops.dispute.dto.DisputeActionResponseDTO;
import com.acquirerx.ops.dispute.dto.DisputeCaseResponseDTO;
import com.acquirerx.ops.dispute.dto.DisputeFilterDTO;
import com.acquirerx.ops.dispute.dto.DisputeStatsDTO;
import com.acquirerx.ops.dispute.dto.DisputeDocumentResponseDTO;
import com.acquirerx.ops.dispute.dto.OpenDisputeRequestDTO;
import com.acquirerx.ops.dispute.entity.DisputeAction;
import com.acquirerx.ops.dispute.entity.DisputeCase;
import com.acquirerx.ops.dispute.entity.DisputeDocument;
import com.acquirerx.ops.dispute.repository.DisputeActionRepository;
import com.acquirerx.ops.dispute.repository.DisputeCaseRepository;
import com.acquirerx.ops.dispute.repository.DisputeDocumentRepository;
import com.acquirerx.ops.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisputeService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "caseId", "openedDate", "closedDate", "deadline", "stage", "status", "merchantId"
    );

    private final DisputeCaseRepository disputeCaseRepository;
    private final DisputeDocumentRepository disputeDocumentRepository;
    private final DisputeActionRepository disputeActionRepository;
    private final TransactionServiceClient transactionClient;
    private final NotificationService notificationService;

    public DisputeCaseResponseDTO openDispute(OpenDisputeRequestDTO dto, Long userId) {
        Long txnId = dto.getTxnId();
        java.math.BigDecimal txnAmount = null;
        Long merchantId = null;
        String merchantName = null;

        try {
            Map<String, Object> txnResp = transactionClient.getTxnById(txnId);
            Map<String, Object> txnData = (Map<String, Object>) txnResp.get("data");
            if (txnData != null) {
                txnAmount = txnData.get("amount") != null
                        ? new java.math.BigDecimal(txnData.get("amount").toString()) : null;
                merchantId = txnData.get("merchantId") != null
                        ? Long.valueOf(txnData.get("merchantId").toString()) : null;
                merchantName = txnData.get("merchantName") != null
                        ? txnData.get("merchantName").toString() : null;
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Transaction not found: " + txnId);
        }

        Optional<DisputeCase> existing = disputeCaseRepository.findByTxnIdAndStatus(txnId, DisputeStatus.OPEN);
        if (existing.isPresent()) {
            throw new IllegalStateException("An open dispute already exists for txn: " + txnId);
        }

        DisputeCase dispute = new DisputeCase();
        dispute.setTxnId(txnId);
        dispute.setTxnAmount(txnAmount);
        dispute.setMerchantId(merchantId);
        dispute.setMerchantName(merchantName);
        dispute.setPanMasked(MaskingUtil.maskPan(dto.getPanMasked()));
        dispute.setStage(DisputeStage.RETRIEVAL);
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setReasonCode(dto.getReasonCode());

        DisputeCase saved = disputeCaseRepository.save(dispute);
        log.info("Dispute opened: caseId={}, txnId={}", saved.getCaseId(), txnId);

        if (userId != null) {
            String msg = "New dispute #" + saved.getCaseId() + " opened for Txn #" + txnId
                    + " – " + dto.getReasonCode();
            try {
                notificationService.send(userId, msg, NotificationCategory.DISPUTE);
            } catch (Exception e) {
                log.warn("Failed to send dispute notification: {}", e.getMessage());
            }
        }

        return toCaseResponse(saved);
    }

    public DisputeCaseResponseDTO advanceStage(Long caseId) {
        DisputeCase dispute = getCaseEntity(caseId);

        if (dispute.getStatus() == DisputeStatus.CLOSED) {
            throw new IllegalStateException("Cannot advance a closed dispute: " + caseId);
        }

        DisputeStage currentStage = dispute.getStage();
        DisputeStage nextStage = getNextStage(currentStage);

        if (nextStage == null) {
            throw new IllegalStateException("Dispute is already at final stage: ARBITRATION");
        }

        dispute.setStage(nextStage);
        DisputeCase saved = disputeCaseRepository.save(dispute);
        log.info("Dispute stage advanced: caseId={}, {} -> {}", caseId, currentStage, nextStage);

        return toCaseResponse(saved);
    }

    public DisputeCaseResponseDTO closeDispute(Long caseId) {
        DisputeCase dispute = getCaseEntity(caseId);

        if (dispute.getStatus() == DisputeStatus.CLOSED) {
            throw new IllegalStateException("Dispute is already closed: " + caseId);
        }

        dispute.setStatus(DisputeStatus.CLOSED);
        dispute.setClosedDate(LocalDateTime.now());

        DisputeCase saved = disputeCaseRepository.save(dispute);
        log.info("Dispute closed: caseId={}", caseId);

        return toCaseResponse(saved);
    }

    public DisputeDocumentResponseDTO addDocument(AddDocumentRequestDTO dto) {
        DisputeCase dispute = getCaseEntity(dto.getCaseId());

        if (dispute.getStatus() == DisputeStatus.CLOSED) {
            throw new IllegalStateException("Cannot add documents to a closed dispute");
        }

        DisputeDocument doc = new DisputeDocument();
        doc.setDisputeCase(dispute);
        doc.setDocType(dto.getDocType());
        doc.setUri(dto.getUri());

        DisputeDocument saved = disputeDocumentRepository.save(doc);
        log.info("Document added: docId={}, caseId={}, type={}", saved.getDocId(), dto.getCaseId(), dto.getDocType());

        return toDocResponse(saved);
    }

    public DisputeActionResponseDTO addAction(DisputeActionRequestDTO dto) {
        DisputeCase dispute = getCaseEntity(dto.getCaseId());

        DisputeAction action = new DisputeAction();
        action.setDisputeCase(dispute);
        action.setActionType(dto.getActionType());
        action.setActorId(dto.getActorId());
        action.setNotes(dto.getNotes());

        DisputeAction saved = disputeActionRepository.save(action);
        log.info("Dispute action added: caseId={}, type={}, actor={}", dto.getCaseId(), dto.getActionType(), dto.getActorId());

        return toActionResponse(saved);
    }

    public PagedResponseDTO<DisputeCaseResponseDTO> getAll(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<DisputeCase> disputePage = disputeCaseRepository.findAll(pageable);
        Page<DisputeCaseResponseDTO> dtoPage = disputePage.map(this::toCaseResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<DisputeCaseResponseDTO> getOpenDisputes(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<DisputeCase> disputePage = disputeCaseRepository.findByStatus(DisputeStatus.OPEN, pageable);
        Page<DisputeCaseResponseDTO> dtoPage = disputePage.map(this::toCaseResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<DisputeCaseResponseDTO> getByStage(DisputeStage stage, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<DisputeCase> disputePage = disputeCaseRepository.findByStage(stage, pageable);
        Page<DisputeCaseResponseDTO> dtoPage = disputePage.map(this::toCaseResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<DisputeCaseResponseDTO> searchDisputes(DisputeFilterDTO filter, PaginationParams pagination) {

        DisputeStage stageEnum = null;
        if (filter.getStage() != null && !filter.getStage().isBlank()) {
            try {
                stageEnum = DisputeStage.valueOf(filter.getStage().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                    "Invalid stage: " + filter.getStage() +
                        ". Valid: RETRIEVAL, CHARGEBACK, REPRESENTMENT, ARBITRATION");
            }
        }

        DisputeStatus statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                statusEnum = DisputeStatus.valueOf(filter.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                    "Invalid status: " + filter.getStatus() +
                        ". Valid: OPEN, CLOSED");
            }
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<DisputeCase> disputePage = disputeCaseRepository.findByFiltersPaged(
            stageEnum,
            statusEnum,
            filter.getReasonCode(),
            filter.getFromDate(),
            filter.getToDate(),
            filter.getMerchantId(),
            filter.getDeadlineExpired(),
            pageable
        );

        log.info("Dispute search: filters={}, total={}", filter, disputePage.getTotalElements());

        Page<DisputeCaseResponseDTO> dtoPage = disputePage.map(this::toCaseResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public DisputeStatsDTO getDisputeStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime warningDate = LocalDateTime.now().plusDays(3);

        long total = disputeCaseRepository.count();
        long open = disputeCaseRepository.countByStatus(DisputeStatus.OPEN);
        long closed = disputeCaseRepository.countByStatus(DisputeStatus.CLOSED);

        long retrieval = disputeCaseRepository.countByStageAndStatus(
            DisputeStage.RETRIEVAL, DisputeStatus.OPEN);
        long chargeback = disputeCaseRepository.countByStageAndStatus(
            DisputeStage.CHARGEBACK, DisputeStatus.OPEN);
        long representment = disputeCaseRepository.countByStageAndStatus(
            DisputeStage.REPRESENTMENT, DisputeStatus.OPEN);
        long arbitration = disputeCaseRepository.countByStageAndStatus(
            DisputeStage.ARBITRATION, DisputeStatus.OPEN);

        long expired = disputeCaseRepository.countExpiredDeadlines();
        long within3Days = disputeCaseRepository.countDeadlineWithinDate(warningDate);

        long openedToday = disputeCaseRepository.countOpenedAfter(todayStart);
        long closedToday = disputeCaseRepository.countClosedAfter(todayStart);

        if (expired > 0) {
            log.warn("URGENT: {} disputes have expired deadlines!", expired);
        }
        if (within3Days > 0) {
            log.warn("WARNING: {} disputes deadline within 3 days!", within3Days);
        }

        log.info("Dispute stats: total={}, open={}, expired={}, within3Days={}",
            total, open, expired, within3Days);

        return new DisputeStatsDTO(
            total, open, closed,
            retrieval, chargeback, representment, arbitration,
            expired, within3Days,
            openedToday, closedToday
        );
    }

    public List<DisputeDocumentResponseDTO> getDocuments(Long caseId) {
        DisputeCase dispute = getCaseEntity(caseId);
        return disputeDocumentRepository.findByDisputeCase(dispute)
                .stream()
                .map(this::toDocResponse)
                .toList();
    }

    public List<DisputeActionResponseDTO> getActions(Long caseId) {
        DisputeCase dispute = getCaseEntity(caseId);
        return disputeActionRepository.findByDisputeCaseOrderByActionDateAsc(dispute)
                .stream()
                .map(this::toActionResponse)
                .toList();
    }

    public DisputeCase getCaseEntity(Long caseId) {
        return disputeCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute case not found: " + caseId));
    }

    public DisputeCaseResponseDTO getCaseById(Long caseId) {
        return toCaseResponse(getCaseEntity(caseId));
    }

    private DisputeStage getNextStage(DisputeStage current) {
        return switch (current) {
            case RETRIEVAL -> DisputeStage.CHARGEBACK;
            case CHARGEBACK -> DisputeStage.REPRESENTMENT;
            case REPRESENTMENT -> DisputeStage.ARBITRATION;
            case ARBITRATION -> null;
        };
    }

    private DisputeCaseResponseDTO toCaseResponse(DisputeCase dispute) {
        DisputeCaseResponseDTO response = new DisputeCaseResponseDTO();
        response.setCaseId(dispute.getCaseId());
        response.setStage(dispute.getStage() != null ? dispute.getStage().name() : null);
        response.setStatus(dispute.getStatus() != null ? dispute.getStatus().name() : null);
        response.setReasonCode(dispute.getReasonCode());
        response.setOpenedDate(dispute.getOpenedDate());
        response.setClosedDate(dispute.getClosedDate());
        response.setDeadline(dispute.getDeadline());
        response.setTxnId(dispute.getTxnId());
        response.setTxnAmount(dispute.getTxnAmount());
        response.setMerchantName(dispute.getMerchantName());
        response.setPanMasked(dispute.getPanMasked());
        return response;
    }

    private DisputeDocumentResponseDTO toDocResponse(DisputeDocument doc) {
        DisputeDocumentResponseDTO response = new DisputeDocumentResponseDTO();
        response.setDocId(doc.getDocId());
        response.setDocType(doc.getDocType());
        response.setUri(doc.getUri());
        response.setUploadedDate(doc.getUploadedDate());
        if (doc.getDisputeCase() != null) {
            response.setCaseId(doc.getDisputeCase().getCaseId());
        }
        return response;
    }

    private DisputeActionResponseDTO toActionResponse(DisputeAction action) {
        DisputeActionResponseDTO response = new DisputeActionResponseDTO();
        response.setActionId(action.getActionId());
        response.setActionType(action.getActionType());
        response.setActorId(action.getActorId());
        response.setNotes(action.getNotes());
        response.setActionDate(action.getActionDate());
        if (action.getDisputeCase() != null) {
            response.setCaseId(action.getDisputeCase().getCaseId());
        }
        return response;
    }
}
