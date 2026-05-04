package com.acquirerx.backend.settlement.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.service.MerchantService;
import com.acquirerx.backend.settlement.dto.AdjustmentRequestDTO;
import com.acquirerx.backend.settlement.dto.AdjustmentResponseDTO;
import com.acquirerx.backend.settlement.dto.PayoutResponseDTO;
import com.acquirerx.backend.settlement.dto.SettlementBatchResponseDTO;
import com.acquirerx.backend.settlement.dto.SettlementFilterDTO;
import com.acquirerx.backend.settlement.dto.SettlementSummaryDTO;
import com.acquirerx.backend.settlement.entity.Adjustment;
import com.acquirerx.backend.settlement.entity.Payout;
import com.acquirerx.backend.settlement.entity.SettlementBatch;
import com.acquirerx.backend.settlement.repository.AdjustmentRepository;
import com.acquirerx.backend.settlement.repository.PayoutRepository;
import com.acquirerx.backend.settlement.repository.SettlementBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final TxnRepository txnRepository;
    private final SettlementBatchRepository settlementBatchRepository;
    private final PayoutRepository payoutRepository;
    private final AdjustmentRepository adjustmentRepository;
    private final MerchantService merchantService;

    // ── SETTLE MERCHANT ──────────────────────
    public SettlementBatchResponseDTO settle(Long merchantId) {

        Merchant merchant = merchantService.getEntityById(merchantId);

        List<Txn> unsettledTxns = txnRepository.findByMerchantAndSettledFalse(merchant);

        if (unsettledTxns.isEmpty()) {
            throw new IllegalStateException(
                    "No unsettled transactions found for merchant: " + merchantId);
        }

        double gross = unsettledTxns.stream().mapToDouble(t -> value(t.getAmount())).sum();
        double fees  = unsettledTxns.stream().mapToDouble(t -> value(t.getTotalFee())).sum();
        double net   = gross - fees;

        SettlementBatch batch = new SettlementBatch();
        batch.setMerchant(merchant);
        batch.setGrossAmount(round(gross));
        batch.setTotalFees(round(fees));
        batch.setNetAmount(round(net));
        batch.setPeriodStart(unsettledTxns.get(0).getTxnDate());
        batch.setPeriodEnd(unsettledTxns.get(unsettledTxns.size() - 1).getTxnDate());
        batch.setTxnCount(unsettledTxns.size());
        batch.setStatus("READY");

        SettlementBatch saved = settlementBatchRepository.save(batch);

        unsettledTxns.forEach(t -> t.setSettled(true));
        txnRepository.saveAll(unsettledTxns);

        log.info("Settlement created: id={}, merchant={}, gross={}, net={}, txns={}",
                saved.getSettleBatchId(), merchantId, gross, net, unsettledTxns.size());

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
        payout.setBankAccountRef("BANK-REF-" + batch.getMerchant().getMerchantId());
        payout.setStatus("POSTED");

        batch.setStatus("PAID");
        settlementBatchRepository.save(batch);

        Payout saved = payoutRepository.save(payout);
        log.info("Payout processed: id={}, amount={}, merchant={}",
                saved.getPayoutId(), saved.getAmount(), batch.getMerchant().getLegalName());

        return toPayoutResponse(saved);
    }

    public AdjustmentResponseDTO createAdjustment(AdjustmentRequestDTO dto) {

        Merchant merchant = merchantService.getEntityById(dto.getMerchantId());

        Adjustment adjustment = new Adjustment();
        adjustment.setMerchant(merchant);
        adjustment.setAmount(dto.getAmount());
        adjustment.setReason(dto.getReason());
        adjustment.setNotes(dto.getNotes());
        adjustment.setStatus("APPLIED");

        Adjustment saved = adjustmentRepository.save(adjustment);
        log.info("Adjustment created: id={}, merchant={}, amount={}, reason={}",
                saved.getAdjustmentId(), merchantId(merchant), dto.getAmount(), dto.getReason());

        return toAdjustmentResponse(saved);
    }

        public PagedResponseDTO<SettlementBatchResponseDTO> getSettlementsByMerchant(
            Long merchantId, int page, int size) {
        Merchant merchant = merchantService.getEntityById(merchantId);

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "postedDate")
        );

        Page<SettlementBatch> batchPage = settlementBatchRepository.findByMerchant(merchant, pageRequest);
        Page<SettlementBatchResponseDTO> dtoPage = batchPage.map(this::toSettlementResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

        public PagedResponseDTO<SettlementBatchResponseDTO> getAllSettlements(
            int page, int size, String sortBy) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<SettlementBatch> batchPage = settlementBatchRepository.findAll(pageRequest);
        Page<SettlementBatchResponseDTO> dtoPage = batchPage.map(this::toSettlementResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<SettlementBatchResponseDTO> searchSettlements(
            SettlementFilterDTO filter, int page, int size, String sortBy) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<SettlementBatch> batchPage = settlementBatchRepository.findByFiltersPaged(
            filter.getStatus(),
            filter.getMerchantId(),
            filter.getMinNetAmount(),
            filter.getMaxNetAmount(),
            filter.getFromDate(),
            filter.getToDate(),
            filter.getMinTxnCount(),
            pageRequest
        );

        log.info("Settlement search: filters={}, total={}", filter, batchPage.getTotalElements());

        Page<SettlementBatchResponseDTO> dtoPage = batchPage.map(this::toSettlementResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public List<PayoutResponseDTO> getPayoutsBySettlement(Long settleBatchId) {
        SettlementBatch batch = settlementBatchRepository.findById(settleBatchId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement batch not found: " + settleBatchId));
        return payoutRepository.findBySettlementBatch(batch)
                .stream()
                .map(this::toPayoutResponse)
                .toList();
    }

        public PagedResponseDTO<AdjustmentResponseDTO> getAdjustmentsByMerchant(
            Long merchantId, int page, int size) {

        Merchant merchant = merchantService.getEntityById(merchantId);

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "postedDate")
        );

        Page<Adjustment> adjustmentPage = adjustmentRepository.findByMerchant(merchant, pageRequest);
        Page<AdjustmentResponseDTO> dtoPage = adjustmentPage.map(this::toAdjustmentResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public SettlementSummaryDTO getSettlementSummary(Long merchantId) {
        Merchant merchant = merchantService.getEntityById(merchantId);

        int total = settlementBatchRepository.findByMerchant(merchant).size();
        long paid = settlementBatchRepository.countByMerchantAndStatus(merchantId, "PAID");
        long ready = settlementBatchRepository.countByMerchantAndStatus(merchantId, "READY");
        long onHold = settlementBatchRepository.countByMerchantAndStatus(merchantId, "ON_HOLD");

        double totalGross = value(settlementBatchRepository.sumGrossByMerchant(merchantId));
        double totalFees = value(settlementBatchRepository.sumFeesByMerchant(merchantId));
        double totalNet = value(settlementBatchRepository.sumNetByMerchant(merchantId));
        double pendingPayout = value(settlementBatchRepository.sumPendingPayoutByMerchant(merchantId));
        double totalAdjustments = value(adjustmentRepository.sumAdjustmentsByMerchant(merchantId));

        log.info("Settlement summary: merchantId={}, total={}, paid={}, pending={}",
            merchantId, total, paid, pendingPayout);

        return new SettlementSummaryDTO(
            merchantId,
            merchant.getLegalName(),
            total,
            (int) paid,
            (int) ready,
            (int) onHold,
            round(totalGross),
            round(totalFees),
            round(totalNet),
            round(totalAdjustments),
            round(pendingPayout)
        );
    }

    private Long merchantId(Merchant merchant) {
        return merchant.getMerchantId();
    }

    private SettlementBatchResponseDTO toSettlementResponse(SettlementBatch batch) {
        SettlementBatchResponseDTO response = new SettlementBatchResponseDTO();
        response.setSettleBatchId(batch.getSettleBatchId());
        response.setGrossAmount(batch.getGrossAmount());
        response.setTotalFees(batch.getTotalFees());
        response.setNetAmount(batch.getNetAmount());
        response.setTxnCount(batch.getTxnCount());
        response.setStatus(batch.getStatus());
        response.setPeriodStart(batch.getPeriodStart());
        response.setPeriodEnd(batch.getPeriodEnd());
        response.setPostedDate(batch.getPostedDate());
        if (batch.getMerchant() != null) {
            response.setMerchantId(batch.getMerchant().getMerchantId());
            response.setMerchantName(batch.getMerchant().getLegalName());
        }
        return response;
    }

    private PayoutResponseDTO toPayoutResponse(Payout payout) {
        PayoutResponseDTO response = new PayoutResponseDTO();
        response.setPayoutId(payout.getPayoutId());
        response.setAmount(payout.getAmount());
        response.setBankAccountRef(payout.getBankAccountRef());
        response.setStatus(payout.getStatus());
        response.setPayoutDate(payout.getPayoutDate());
        if (payout.getSettlementBatch() != null) {
            response.setSettleBatchId(payout.getSettlementBatch().getSettleBatchId());
            if (payout.getSettlementBatch().getMerchant() != null) {
                response.setMerchantId(payout.getSettlementBatch().getMerchant().getMerchantId());
                response.setMerchantName(payout.getSettlementBatch().getMerchant().getLegalName());
            }
        }
        return response;
    }

    private AdjustmentResponseDTO toAdjustmentResponse(Adjustment adjustment) {
        AdjustmentResponseDTO response = new AdjustmentResponseDTO();
        response.setAdjustmentId(adjustment.getAdjustmentId());
        response.setAmount(adjustment.getAmount());
        response.setReason(adjustment.getReason());
        response.setNotes(adjustment.getNotes());
        response.setStatus(adjustment.getStatus());
        response.setPostedDate(adjustment.getPostedDate());
        if (adjustment.getMerchant() != null) {
            response.setMerchantId(adjustment.getMerchant().getMerchantId());
            response.setMerchantName(adjustment.getMerchant().getLegalName());
        }
        return response;
    }

    private double value(Double amount) {
        return amount == null ? 0.0 : amount;
    }

    private double round(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }
}
