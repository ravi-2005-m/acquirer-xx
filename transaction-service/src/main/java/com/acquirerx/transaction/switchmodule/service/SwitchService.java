package com.acquirerx.transaction.switchmodule.service;

import com.acquirerx.transaction.client.RiskServiceClient;
import com.acquirerx.transaction.client.TerminalServiceClient;
import com.acquirerx.transaction.client.MerchantServiceClient;
import com.acquirerx.transaction.common.dto.PagedResponseDTO;
import com.acquirerx.transaction.common.pagination.PaginationParams;
import com.acquirerx.transaction.common.util.MaskingUtil;
import com.acquirerx.transaction.switchmodule.dto.*;
import com.acquirerx.transaction.switchmodule.entity.AuthMessage;
import com.acquirerx.transaction.switchmodule.entity.Batch;
import com.acquirerx.transaction.switchmodule.enums.BatchStatus;
import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import com.acquirerx.transaction.switchmodule.repository.AuthMessageRepository;
import com.acquirerx.transaction.switchmodule.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SwitchService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "authId", "amount", "status", "terminalId", "merchantId", "txnTime"
    );

    private final AuthMessageRepository authRepo;
    private final BatchRepository batchRepo;
    private final TerminalServiceClient terminalClient;
    private final RiskServiceClient riskClient;
    private final MerchantServiceClient merchantClient;

    // Helper: get terminal info via Feign
    private Map<String, Object> getTerminalData(Long terminalId) {
        try {
            Map<String, Object> resp = terminalClient.getTerminalById(terminalId);
            Map<String, Object> data = (Map<String, Object>) resp.get("data");
            if (data == null) {
                data = resp;
            }
            return data;
        } catch (Exception e) {
            log.error("Terminal not found or unreachable: {}", terminalId, e);
            throw new IllegalStateException("Terminal not found: " + terminalId);
        }
    }

    // OPEN BATCH
    public BatchResponseDTO openBatch(Long terminalId) {
        Map<String, Object> termData = getTerminalData(terminalId);

        batchRepo.findByTerminalIdAndStatus(terminalId, BatchStatus.OPEN)
                .ifPresent(b -> {
                    throw new IllegalStateException(
                            "Batch already open for terminal: " + termData.get("tid"));
                });

        Long batchMerchantId = termData.get("merchantId") != null
                ? Long.valueOf(termData.get("merchantId").toString()) : null;

        Batch batch = new Batch();
        batch.setTerminalId(terminalId);
        batch.setMerchantId(batchMerchantId);
        batch.setStatus(BatchStatus.OPEN);
        batch.setOpenTime(LocalDateTime.now());

        Batch saved = batchRepo.save(batch);
        log.info("Batch opened: id={}, terminalId={}", saved.getBatchId(), terminalId);
        return toBatchResponse(saved, termData);
    }

    // CLOSE BATCH
    public BatchResponseDTO closeBatch(Long terminalId) {
        Map<String, Object> termData = getTerminalData(terminalId);

        Batch batch = batchRepo.findByTerminalIdAndStatus(terminalId, BatchStatus.OPEN)
                .orElseThrow(() -> new IllegalStateException(
                        "No open batch for terminal: " + termData.get("tid")));

        batch.setStatus(BatchStatus.CLOSED);
        batch.setCloseTime(LocalDateTime.now());

        Batch saved = batchRepo.save(batch);
        log.info("Batch closed: id={}, terminalId={}", saved.getBatchId(), terminalId);
        return toBatchResponse(saved, termData);
    }

    // AUTHORIZE
    public AuthResponseDTO authorize(AuthorizeRequestDTO dto) {

        // Step 1: Get terminal info via Feign
        Map<String, Object> termData = getTerminalData(dto.getTerminalId());
        String tid = termData.get("tid") != null ? termData.get("tid").toString() : null;
        Long merchantId = termData.get("merchantId") != null
                ? Long.valueOf(termData.get("merchantId").toString()) : null;
        String merchantName = termData.get("merchantName") != null
                ? termData.get("merchantName").toString() : null;
        String merchantMcc = null;
        String merchantRegion = "NA";

        try {
            if (merchantId != null) {
                Map<String, Object> merchantResp = merchantClient.getMerchantById(merchantId);
                Map<String, Object> merchantData = (Map<String, Object>) merchantResp.get("data");
                if (merchantData == null) {
                    merchantData = merchantResp;
                }
                Object status = merchantData.get("status");
                if (status != null && !"ACTIVE".equals(status.toString())) {
                    throw new IllegalStateException(
                        "Transaction declined: merchant is " + status);
                }
                Object mcc = merchantData.get("mcc");
                Object region = merchantData.get("region");
                merchantMcc = mcc != null ? mcc.toString() : null;
                merchantRegion = region != null ? region.toString() : "NA";
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception ex) {
            log.warn("Unable to enrich merchant MCC/region for merchantId={}: {}", merchantId, ex.getMessage());
        }

        // Step 2: Verify batch is open
        batchRepo.findByTerminalIdAndStatus(dto.getTerminalId(), BatchStatus.OPEN)
                .orElseThrow(() -> new IllegalStateException(
                        "No open batch for terminal. Please open batch first."));

        // Step 3: Risk check via Feign (fail-closed: BLOCK if unreachable)
        String riskResult = "ALLOW";
        int riskScore = 0;
        String riskReason = "All checks passed";

        try {
            Map<String, Object> riskResp = riskClient.checkRisk(
                    dto.getAmount().doubleValue(), dto.getPanMasked(), tid);
            Map<String, Object> riskData = (Map<String, Object>) riskResp.get("data");
            if (riskData != null) {
                riskResult = riskData.get("result") != null
                        ? riskData.get("result").toString() : "ALLOW";
                riskScore = riskData.get("score") != null
                        ? Integer.parseInt(riskData.get("score").toString()) : 0;
                riskReason = riskData.get("reason") != null
                        ? riskData.get("reason").toString() : "All checks passed";
            }
        } catch (Exception e) {
            log.error("Risk service unavailable, failing CLOSED: {}", e.getMessage());
            riskResult = "BLOCK";
            riskScore = 100;
            riskReason = "Risk service unavailable - fail-closed BLOCK";
        }

        log.info("Risk check result: result={}, score={}, reason={}", riskResult, riskScore, riskReason);

        // Step 4: Build AuthMessage
        AuthMessage auth = new AuthMessage();
        auth.setTerminalId(dto.getTerminalId());
        auth.setMerchantId(merchantId);
        auth.setTid(tid);
        auth.setMerchantName(merchantName);
        auth.setAmount(dto.getAmount());
        auth.setCurrency(dto.getCurrency());
        auth.setTxnType(dto.getTxnType() != null ? dto.getTxnType() : "SALE");
        auth.setNetwork("LOCALSIM");
        auth.setPanMasked(MaskingUtil.maskPan(dto.getPanMasked()));
        auth.setMerchantMcc(merchantMcc);
        auth.setMerchantRegion(merchantRegion);

        // Step 4b: Enforce param profile limits (currency, PIN threshold, contactless limit)
        String paramsJsonStr = termData.get("paramsJson") != null ? termData.get("paramsJson").toString() : null;
        if (paramsJsonStr != null && !paramsJsonStr.isBlank()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> params = new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(paramsJsonStr, Map.class);
                String declineCode = null;
                String declineReason = null;

                Object profileCurrency = params.get("currency");
                if (profileCurrency != null && dto.getCurrency() != null
                        && !profileCurrency.toString().equalsIgnoreCase(dto.getCurrency())) {
                    declineCode = "57";
                    declineReason = "Currency not accepted at this terminal";
                }

                if (declineCode == null) {
                    Object pinThresh = params.get("pinRequiredAbove");
                    if (pinThresh != null) {
                        BigDecimal threshold = new BigDecimal(pinThresh.toString());
                        if (dto.getAmount().compareTo(threshold) > 0) {
                            declineCode = "65";
                            declineReason = "PIN required for amounts above " + threshold;
                        }
                    }
                }

                if (declineCode == null) {
                    Object ctlsLimitVal = params.get("ctlsLimit");
                    String capability = termData.get("capability") != null ? termData.get("capability").toString() : null;
                    if (ctlsLimitVal != null && "CTLS".equalsIgnoreCase(capability)) {
                        BigDecimal ctlsLimit = new BigDecimal(ctlsLimitVal.toString());
                        if (dto.getAmount().compareTo(ctlsLimit) > 0) {
                            declineCode = "65";
                            declineReason = "Amount exceeds contactless limit of " + ctlsLimit;
                        }
                    }
                }

                if (declineCode != null) {
                    auth.setStatus(TxnStatus.DECLINED);
                    auth.setAuthCode(null);
                    auth.setResponseCode(declineCode);
                    auth.setRiskScore(0);
                    auth.setRiskReason(declineReason);
                    AuthMessage saved = authRepo.save(auth);
                    log.warn("Param profile decline: code={}, reason={}, tid={}", declineCode, declineReason, tid);
                    return toAuthResponse(saved);
                }
            } catch (Exception e) {
                log.warn("Failed to parse paramsJson for terminal {}: {}", dto.getTerminalId(), e.getMessage());
            }
        }

        // Step 5: Authorization decision
        if ("BLOCK".equals(riskResult)) {
            auth.setStatus(TxnStatus.DECLINED);
            auth.setAuthCode(null);
            auth.setResponseCode("05");
            auth.setRiskScore(riskScore);
            auth.setRiskReason(riskReason);
            log.warn("Transaction BLOCKED: amount={}, tid={}", dto.getAmount(), tid);
        } else if (dto.getAmount().compareTo(new BigDecimal("50000")) <= 0) {
            auth.setStatus(TxnStatus.APPROVED);
            auth.setAuthCode("A" + System.currentTimeMillis());
            auth.setResponseCode("00");
            auth.setRiskScore(riskScore);
            auth.setRiskReason(riskReason);
            if ("REVIEW".equals(riskResult)) {
                log.warn("Transaction APPROVED but REVIEW: amount={}, tid={}", dto.getAmount(), tid);
            }
        } else {
            auth.setStatus(TxnStatus.DECLINED);
            auth.setAuthCode(null);
            auth.setResponseCode("51");
            auth.setRiskScore(riskScore);
            auth.setRiskReason(riskReason);
        }

        AuthMessage saved = authRepo.save(auth);
        log.info("Transaction {}: authId={}, amount={}, merchant={}", saved.getStatus(), saved.getAuthId(), saved.getAmount(), merchantName);
        return toAuthResponse(saved);
    }

    // VOID
    public AuthResponseDTO voidTransaction(VoidRequestDTO dto) {
        AuthMessage original = getAuthEntityById(dto.getOriginalAuthId());

        if (original.getStatus() != TxnStatus.APPROVED) {
            throw new IllegalStateException("Cannot void a non-approved transaction: " + dto.getOriginalAuthId());
        }
        if (!"SALE".equals(original.getTxnType())) {
            throw new IllegalStateException("Cannot void a non-SALE transaction: " + original.getTxnType());
        }

        batchRepo.findByTerminalIdAndStatus(dto.getTerminalId(), BatchStatus.OPEN)
                .orElseThrow(() -> new IllegalStateException("No open batch for terminal. Cannot process void."));

        original.setStatus(TxnStatus.REVERSED);
        authRepo.save(original);

        AuthMessage voidAuth = new AuthMessage();
        voidAuth.setTerminalId(dto.getTerminalId());
        voidAuth.setMerchantId(original.getMerchantId());
        voidAuth.setMerchantName(original.getMerchantName());
        voidAuth.setTid(original.getTid());
        voidAuth.setAmount(original.getAmount());
        voidAuth.setCurrency(original.getCurrency());
        voidAuth.setTxnType("VOID");
        voidAuth.setNetwork("LOCALSIM");
        voidAuth.setPanMasked(original.getPanMasked());
        voidAuth.setStatus(TxnStatus.APPROVED);
        voidAuth.setAuthCode("V" + System.currentTimeMillis());
        voidAuth.setResponseCode("00");
        voidAuth.setOriginalAuthId(dto.getOriginalAuthId());

        AuthMessage saved = authRepo.save(voidAuth);
        log.info("Void processed: voidAuthId={}, originalAuthId={}", saved.getAuthId(), dto.getOriginalAuthId());
        return toAuthResponse(saved);
    }

    // REFUND
    public AuthResponseDTO refundTransaction(RefundRequestDTO dto) {
        AuthMessage original = getAuthEntityById(dto.getOriginalAuthId());

        if (original.getStatus() != TxnStatus.APPROVED) {
            throw new IllegalStateException("Cannot refund a non-approved transaction: " + dto.getOriginalAuthId());
        }

        if (dto.getAmount().compareTo(original.getAmount()) > 0) {
            throw new IllegalArgumentException(
                    "Refund amount (" + dto.getAmount() + ") cannot exceed original amount (" + original.getAmount() + ")");
        }

        batchRepo.findByTerminalIdAndStatus(dto.getTerminalId(), BatchStatus.OPEN)
                .orElseThrow(() -> new IllegalStateException("No open batch for terminal. Cannot process refund."));

        AuthMessage refundAuth = new AuthMessage();
        refundAuth.setTerminalId(dto.getTerminalId());
        refundAuth.setMerchantId(original.getMerchantId());
        refundAuth.setMerchantName(original.getMerchantName());
        refundAuth.setTid(original.getTid());
        refundAuth.setAmount(dto.getAmount());
        refundAuth.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : original.getCurrency());
        refundAuth.setTxnType("REFUND");
        refundAuth.setNetwork("LOCALSIM");
        refundAuth.setPanMasked(original.getPanMasked());
        refundAuth.setStatus(TxnStatus.APPROVED);
        refundAuth.setAuthCode("R" + System.currentTimeMillis());
        refundAuth.setResponseCode("00");
        refundAuth.setOriginalAuthId(dto.getOriginalAuthId());

        AuthMessage saved = authRepo.save(refundAuth);
        log.info("Refund processed: refundAuthId={}, originalAuthId={}, amount={}", saved.getAuthId(), dto.getOriginalAuthId(), dto.getAmount());
        return toAuthResponse(saved);
    }

    // GET ALL (PAGED)
    public PagedResponseDTO<AuthResponseDTO> getAll(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<AuthMessage> authPage = authRepo.findAll(pageable);
        return new PagedResponseDTO<>(authPage.map(this::toAuthResponse));
    }

    // SEARCH (PAGED)
    public PagedResponseDTO<AuthResponseDTO> search(TransactionFilterDTO filter, PaginationParams pagination) {
        TxnStatus statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            statusEnum = TxnStatus.valueOf(filter.getStatus().toUpperCase());
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<AuthMessage> authPage = authRepo.findByFiltersPaged(
                statusEnum, filter.getTxnType(),
                filter.getMinAmount(), filter.getMaxAmount(),
                filter.getFromDate(), filter.getToDate(),
                filter.getMerchantId(), filter.getTerminalId(),
                filter.getNetwork(), pageable);

        return new PagedResponseDTO<>(authPage.map(this::toAuthResponse));
    }

    // HAS OPEN BATCHES FOR MERCHANT
    public boolean hasOpenBatchesForMerchant(Long merchantId) {
        return batchRepo.existsByMerchantIdAndStatus(merchantId, BatchStatus.OPEN);
    }

    // GET BATCHES
    public List<BatchResponseDTO> getBatchesByTerminal(Long terminalId) {
        return batchRepo.findByTerminalId(terminalId).stream()
                .map(b -> toBatchResponse(b, null))
                .toList();
    }

    // STATS
    public TransactionStatsDTO getStats(TransactionFilterDTO filter) {
        TxnStatus statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            statusEnum = TxnStatus.valueOf(filter.getStatus().toUpperCase());
        }

        BigDecimal total = authRepo.sumAmountByFilters(
                statusEnum, filter.getTxnType(),
                filter.getMerchantId(), filter.getTerminalId(),
                filter.getFromDate(), filter.getToDate());

        List<Object[]> rows = authRepo.countByType(
                statusEnum,
                filter.getMerchantId(), filter.getTerminalId(),
                filter.getFromDate(), filter.getToDate());

        Map<String, Long> byType = new java.util.LinkedHashMap<>();
        for (Object[] row : rows) {
            byType.put((String) row[0], (Long) row[1]);
        }

        long totalTransactions = byType.values().stream().mapToLong(Long::longValue).sum();
        return new TransactionStatsDTO(totalTransactions, total != null ? total : BigDecimal.ZERO, byType);
    }

    // INTERNAL
    public AuthMessage getAuthEntityById(Long authId) {
        return authRepo.findById(authId)
                .orElseThrow(() -> new IllegalStateException("Auth message not found: " + authId));
    }

    public AuthResponseDTO getAuthById(Long authId) {
        return toAuthResponse(getAuthEntityById(authId));
    }

    // MAPPERS
    private AuthResponseDTO toAuthResponse(AuthMessage auth) {
        AuthResponseDTO r = new AuthResponseDTO();
        r.setAuthId(auth.getAuthId());
        r.setTxnType(auth.getTxnType());
        r.setAmount(auth.getAmount());
        r.setCurrency(auth.getCurrency());
        r.setAuthCode(auth.getAuthCode());
        r.setResponseCode(auth.getResponseCode());
        r.setNetwork(auth.getNetwork());
        r.setStatus(auth.getStatus() != null ? auth.getStatus().name() : null);
        r.setPanMasked(auth.getPanMasked());
        r.setTxnTime(auth.getTxnTime());
        r.setRiskScore(auth.getRiskScore());
        r.setRiskReason(auth.getRiskReason());
        r.setOriginalAuthId(auth.getOriginalAuthId());
        r.setTerminalId(auth.getTerminalId());
        r.setTid(auth.getTid());
        r.setMerchantId(auth.getMerchantId());
        r.setMerchantName(auth.getMerchantName());
        return r;
    }

    private BatchResponseDTO toBatchResponse(Batch batch, Map<String, Object> termData) {
        BatchResponseDTO r = new BatchResponseDTO();
        r.setBatchId(batch.getBatchId());
        r.setStatus(batch.getStatus() != null ? batch.getStatus().name() : null);
        r.setOpenTime(batch.getOpenTime());
        r.setCloseTime(batch.getCloseTime());
        r.setTerminalId(batch.getTerminalId());
        if (termData != null) {
            r.setTid(termData.get("tid") != null ? termData.get("tid").toString() : null);
            r.setMerchantId(termData.get("merchantId") != null
                    ? Long.valueOf(termData.get("merchantId").toString()) : null);
            r.setMerchantName(termData.get("merchantName") != null
                    ? termData.get("merchantName").toString() : null);
        }
        return r;
    }
}