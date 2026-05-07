package com.acquirerx.settlement.settlement.service;

import com.acquirerx.settlement.client.MerchantServiceClient;
import com.acquirerx.settlement.client.TransactionServiceClient;
import com.acquirerx.settlement.common.dto.PagedResponseDTO;
import com.acquirerx.settlement.common.exception.ResourceNotFoundException;
import com.acquirerx.settlement.common.pagination.PaginationParams;
import com.acquirerx.settlement.settlement.dto.AdjustmentRequestDTO;
import com.acquirerx.settlement.settlement.dto.AdjustmentResponseDTO;
import com.acquirerx.settlement.settlement.dto.PayoutResponseDTO;
import com.acquirerx.settlement.settlement.dto.SettlementBatchResponseDTO;
import com.acquirerx.settlement.settlement.dto.SettlementFilterDTO;
import com.acquirerx.settlement.settlement.dto.SettlementStatsDTO;
import com.acquirerx.settlement.settlement.dto.SettlementSummaryDTO;
import com.acquirerx.settlement.settlement.entity.Adjustment;
import com.acquirerx.settlement.settlement.entity.Payout;
import com.acquirerx.settlement.settlement.entity.SettlementBatch;
import com.acquirerx.settlement.settlement.repository.AdjustmentRepository;
import com.acquirerx.settlement.settlement.repository.PayoutRepository;
import com.acquirerx.settlement.settlement.repository.SettlementBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private static final Set<String> SETTLEMENT_SORT_FIELDS = Set.of(
            "settleBatchId", "merchantId", "grossAmount", "netAmount", "txnCount", "status", "postedDate"
    );
    private static final Set<String> ADJUSTMENT_SORT_FIELDS = Set.of(
            "adjustmentId", "merchantId", "amount", "type", "status", "postedDate"
    );

    private final SettlementBatchRepository settlementBatchRepository;
    private final PayoutRepository payoutRepository;
    private final AdjustmentRepository adjustmentRepository;
    private final TransactionServiceClient transactionClient;
    private final MerchantServiceClient merchantClient;

    public SettlementBatchResponseDTO settle(Long merchantId) {
        String merchantName = null;
        try {
            Map<String, Object> merchantResp = merchantClient.getMerchantById(merchantId);
            Map<String, Object> merchantData = (Map<String, Object>) merchantResp.get("data");
            if (merchantData != null && merchantData.get("legalName") != null) {
                String resolved = merchantData.get("legalName").toString();
                // Don't persist the Feign fallback placeholder — leave the
                // column null and let the frontend fall back to "Merchant #X".
                if (!resolved.toLowerCase().contains("unavailable")
                        && !"unknown".equalsIgnoreCase(resolved)) {
                    merchantName = resolved;
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch merchant info: {}", e.getMessage());
        }

        Map<String, Object> txnResp;
        try {
            txnResp = transactionClient.getUnsettledTxns(merchantId);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Cannot fetch unsettled txns from transaction-service: " + e.getMessage());
        }

        List<Map<String, Object>> txnList = null;
        Object dataObj = txnResp.get("data");
        if (dataObj instanceof List) {
            txnList = (List<Map<String, Object>>) dataObj;
        }

        if (txnList == null || txnList.isEmpty()) {
            throw new IllegalStateException("No unsettled transactions found for merchant: " + merchantId);
        }

        BigDecimal grossAmount = BigDecimal.ZERO;
        BigDecimal totalFees = BigDecimal.ZERO;

        for (Map<String, Object> txn : txnList) {
            BigDecimal amount = txn.get("amount") != null
                    ? new BigDecimal(txn.get("amount").toString()) : BigDecimal.ZERO;
            BigDecimal fee = txn.get("totalFee") != null
                    ? new BigDecimal(txn.get("totalFee").toString()) : BigDecimal.ZERO;
            grossAmount = grossAmount.add(amount);
            totalFees = totalFees.add(fee);
        }

        BigDecimal netAmount = grossAmount.subtract(totalFees);

        SettlementBatch batch = new SettlementBatch();
        batch.setMerchantId(merchantId);
        batch.setMerchantName(merchantName);
        batch.setPeriodStart(LocalDateTime.now().minusDays(1));
        batch.setPeriodEnd(LocalDateTime.now());
        batch.setGrossAmount(grossAmount.setScale(4, RoundingMode.HALF_UP));
        batch.setTotalFees(totalFees.setScale(4, RoundingMode.HALF_UP));
        batch.setNetAmount(netAmount.setScale(4, RoundingMode.HALF_UP));
        batch.setTxnCount(txnList.size());
        batch.setStatus("PAID");

        SettlementBatch saved = settlementBatchRepository.save(batch);

        Payout payout = new Payout();
        payout.setSettlementBatch(saved);
        payout.setBankAccountRef("BANK-REF-" + merchantId);
        payout.setAmount(saved.getNetAmount());
        payout.setStatus("POSTED");
        payoutRepository.save(payout);

        try {
            transactionClient.markTxnsSettled(merchantId);
            log.info("Marked txns settled for merchant: {}", merchantId);
        } catch (Exception e) {
            log.error("Failed to mark txns settled: {}", e.getMessage());
        }

        log.info("Settlement complete: merchantId={}, gross={}, fees={}, net={}, txnCount={}",
                merchantId, grossAmount, totalFees, netAmount, txnList.size());

        return toSettlementResponse(saved);
    }

    public PayoutResponseDTO processPayout(Long settleBatchId) {
        SettlementBatch batch = settlementBatchRepository.findById(settleBatchId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement batch not found: " + settleBatchId));

        payoutRepository.findBySettlementBatch_SettleBatchId(settleBatchId)
                .ifPresent(p -> {
                    throw new IllegalStateException("Payout already processed for batch: " + settleBatchId);
                });

        if ("ON_HOLD".equals(batch.getStatus())) {
            throw new IllegalStateException("Settlement batch is on hold — cannot process payout");
        }

        Payout payout = new Payout();
        payout.setSettlementBatch(batch);
        payout.setAmount(batch.getNetAmount());
        payout.setBankAccountRef("BANK-REF-" + batch.getMerchantId());
        payout.setStatus("POSTED");

        batch.setStatus("PAID");
        settlementBatchRepository.save(batch);

        Payout saved = payoutRepository.save(payout);
        return toPayoutResponse(saved);
    }

    public PagedResponseDTO<SettlementBatchResponseDTO> getAllSettlements(PaginationParams pagination) {
        pagination.validateSortField(SETTLEMENT_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<SettlementBatch> batchPage = settlementBatchRepository.findAll(pageable);
        return new PagedResponseDTO<>(batchPage.map(this::toSettlementResponse));
    }

    public PagedResponseDTO<SettlementBatchResponseDTO> getSettlementsByMerchant(Long merchantId, PaginationParams pagination) {
        pagination.validateSortField(SETTLEMENT_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<SettlementBatch> batchPage = settlementBatchRepository.findByMerchantId(merchantId, pageable);
        return new PagedResponseDTO<>(batchPage.map(this::toSettlementResponse));
    }

    public PagedResponseDTO<SettlementBatchResponseDTO> searchSettlements(SettlementFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(SETTLEMENT_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<SettlementBatch> batchPage = settlementBatchRepository.findByFiltersPaged(
                filter.getStatus(), filter.getMerchantId(),
                filter.getMinNetAmount(), filter.getMaxNetAmount(),
                filter.getFromDate(), filter.getToDate(),
                filter.getMinTxnCount(), pageable);
        return new PagedResponseDTO<>(batchPage.map(this::toSettlementResponse));
    }

    public List<PayoutResponseDTO> getPayoutsBySettlement(Long settleBatchId) {
        SettlementBatch batch = settlementBatchRepository.findById(settleBatchId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement batch not found: " + settleBatchId));
        return payoutRepository.findBySettlementBatch(batch)
                .stream()
                .map(this::toPayoutResponse)
                .toList();
    }

    public SettlementSummaryDTO getSettlementSummary(Long merchantId) {
        String merchantName = null;
        try {
            Map<String, Object> resp = merchantClient.getMerchantById(merchantId);
            Map<String, Object> data = (Map<String, Object>) resp.get("data");
            if (data != null && data.get("legalName") != null) {
                String resolved = data.get("legalName").toString();
                if (!resolved.toLowerCase().contains("unavailable")
                        && !"unknown".equalsIgnoreCase(resolved)) {
                    merchantName = resolved;
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch merchant name: {}", e.getMessage());
        }

        int total = settlementBatchRepository.findByMerchantId(merchantId).size();
        long paid = val(settlementBatchRepository.countByMerchantIdAndStatus(merchantId, "PAID"));
        long ready = val(settlementBatchRepository.countByMerchantIdAndStatus(merchantId, "READY"));
        long onHold = val(settlementBatchRepository.countByMerchantIdAndStatus(merchantId, "ON_HOLD"));

        BigDecimal totalGross = bdval(settlementBatchRepository.sumGrossByMerchant(merchantId));
        BigDecimal totalFees = bdval(settlementBatchRepository.sumFeesByMerchant(merchantId));
        BigDecimal totalNet = bdval(settlementBatchRepository.sumNetByMerchant(merchantId));
        BigDecimal pending = bdval(settlementBatchRepository.sumPendingPayoutByMerchant(merchantId));
        BigDecimal totalAdj = bdval(adjustmentRepository.sumAdjustmentsByMerchant(merchantId));

        return new SettlementSummaryDTO(
                merchantId, merchantName,
                total, (int) paid, (int) ready, (int) onHold,
                totalGross, totalFees, totalNet,
                totalAdj, pending
        );
    }

    public AdjustmentResponseDTO createAdjustment(AdjustmentRequestDTO dto) {
        Adjustment adj = new Adjustment();
        adj.setMerchantId(dto.getMerchantId());
        adj.setTxnId(dto.getTxnId());
        adj.setAmount(dto.getAmount());
        adj.setReason(dto.getReason());
        adj.setType(dto.getType());

        Adjustment saved = adjustmentRepository.save(adj);
        log.info("Adjustment created: merchantId={}, amount={}, type={}",
                dto.getMerchantId(), dto.getAmount(), dto.getType());
        return toAdjustmentResponse(saved);
    }

    public PagedResponseDTO<AdjustmentResponseDTO> getAdjustmentsByMerchant(Long merchantId, PaginationParams pagination) {
        pagination.validateSortField(ADJUSTMENT_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<Adjustment> adjPage = adjustmentRepository.findByMerchantId(merchantId, pageable);
        return new PagedResponseDTO<>(adjPage.map(this::toAdjustmentResponse));
    }

    private long val(Long v) { return v != null ? v : 0L; }
    private BigDecimal bdval(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private SettlementBatchResponseDTO toSettlementResponse(SettlementBatch b) {
        SettlementBatchResponseDTO r = new SettlementBatchResponseDTO();
        r.setSettleBatchId(b.getSettleBatchId());
        r.setMerchantId(b.getMerchantId());
        r.setMerchantName(b.getMerchantName());
        r.setPeriodStart(b.getPeriodStart());
        r.setPeriodEnd(b.getPeriodEnd());
        r.setGrossAmount(b.getGrossAmount());
        r.setTotalFees(b.getTotalFees());
        r.setNetAmount(b.getNetAmount());
        r.setTxnCount(b.getTxnCount());
        r.setStatus(b.getStatus());
        r.setPostedDate(b.getPostedDate());
        return r;
    }

    private PayoutResponseDTO toPayoutResponse(Payout p) {
        PayoutResponseDTO r = new PayoutResponseDTO();
        r.setPayoutId(p.getPayoutId());
        r.setAmount(p.getAmount());
        r.setBankAccountRef(p.getBankAccountRef());
        r.setStatus(p.getStatus());
        r.setPayoutDate(p.getPayoutDate());
        if (p.getSettlementBatch() != null) {
            r.setSettleBatchId(p.getSettlementBatch().getSettleBatchId());
            r.setMerchantId(p.getSettlementBatch().getMerchantId());
            r.setMerchantName(p.getSettlementBatch().getMerchantName());
        }
        return r;
    }

    private AdjustmentResponseDTO toAdjustmentResponse(Adjustment a) {
        AdjustmentResponseDTO r = new AdjustmentResponseDTO();
        r.setAdjustmentId(a.getAdjustmentId());
        r.setMerchantId(a.getMerchantId());
        r.setTxnId(a.getTxnId());
        r.setAmount(a.getAmount());
        r.setReason(a.getReason());
        r.setType(a.getType());
        r.setStatus(a.getStatus());
        r.setPostedDate(a.getPostedDate());
        return r;
    }

    public SettlementStatsDTO getStats() {
        long total = settlementBatchRepository.count();
        long ready = settlementBatchRepository.countByStatus("READY");
        long paid = settlementBatchRepository.countByStatus("PAID");
        long onHold = settlementBatchRepository.countByStatus("ON_HOLD");
        BigDecimal gross = settlementBatchRepository.sumGrossAmount();
        BigDecimal net = settlementBatchRepository.sumNetAmount();
        BigDecimal fees = settlementBatchRepository.sumTotalFees();
        return new SettlementStatsDTO(total, ready, paid, onHold,
                gross != null ? gross : BigDecimal.ZERO,
                net != null ? net : BigDecimal.ZERO,
                fees != null ? fees : BigDecimal.ZERO);
    }
}
