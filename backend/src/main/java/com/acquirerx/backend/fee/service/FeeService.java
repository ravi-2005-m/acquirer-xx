package com.acquirerx.backend.fee.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.fee.dto.FeeSummaryDTO;
import com.acquirerx.backend.fee.dto.FeeRuleRequestDTO;
import com.acquirerx.backend.fee.dto.FeeRuleResponseDTO;
import com.acquirerx.backend.fee.dto.TxnFilterDTO;
import com.acquirerx.backend.fee.dto.TxnResponseDTO;
import com.acquirerx.backend.fee.entity.FeeRule;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.FeeRuleRepository;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.service.MerchantService;
import com.acquirerx.backend.switchmodule.entity.AuthMessage;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import com.acquirerx.backend.switchmodule.service.SwitchService;
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
public class FeeService {

    private final FeeRuleRepository feeRuleRepository;
    private final TxnRepository txnRepository;
    private final SwitchService switchService;
    private final MerchantService merchantService;

    // ── CREATE FEE RULE ──────────────────────
    public FeeRuleResponseDTO createFeeRule(FeeRuleRequestDTO dto) {
        FeeRule rule = new FeeRule();
        rule.setRuleType(dto.getRuleType());
        rule.setDescription(dto.getDescription());
        rule.setRatePct(dto.getRatePct());
        rule.setFlatFee(dto.getFlatFee() != null ? dto.getFlatFee() : 0.0);
        rule.setEffectiveFrom(dto.getEffectiveFrom());
        rule.setEffectiveTo(dto.getEffectiveTo());
        rule.setActive(true);

        FeeRule saved = feeRuleRepository.save(rule);
        log.info("Fee rule created: id={}, type={}, rate={}%",
                saved.getFeeRuleId(), saved.getRuleType(), saved.getRatePct());
        return toFeeRuleResponse(saved);
    }

    // ── GET ALL ACTIVE FEE RULES ─────────────
    public List<FeeRuleResponseDTO> getActiveFeeRules() {
        return feeRuleRepository.findByActiveTrue()
                .stream()
                .map(this::toFeeRuleResponse)
                .toList();
    }

    // ── DEACTIVATE FEE RULE ──────────────────
    public FeeRuleResponseDTO deactivateFeeRule(Long feeRuleId) {
        FeeRule rule = feeRuleRepository.findById(feeRuleId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee rule not found: " + feeRuleId));
        rule.setActive(false);
        return toFeeRuleResponse(feeRuleRepository.save(rule));
    }

    // ── CALCULATE FEE ────────────────────────
    public double calculateFee(double amount) {
        List<FeeRule> activeRules = feeRuleRepository.findByActiveTrue();

        if (activeRules.isEmpty()) {
            log.warn("No active fee rules found — fee will be 0");
            return 0.0;
        }

        double totalFee = 0.0;
        for (FeeRule rule : activeRules) {
            totalFee += amount * rule.getRatePct() / 100;
            totalFee += rule.getFlatFee();
        }

        return Math.round(totalFee * 100.0) / 100.0;
    }

    // ── CREATE TXN FROM AUTH ─────────────────
    // Called after authorization is approved.
    // Pass the authId from the authorize response.
    public TxnResponseDTO createTxnFromAuth(Long authId) {

        AuthMessage auth = switchService.getAuthEntityById(authId);

        if (auth.getStatus() != TxnStatus.APPROVED) {
            throw new IllegalStateException(
                    "Cannot create Txn for non-approved auth: " + authId);
        }

        double amount = auth.getAmount();
        double totalFee = calculateFee(amount);

        // Break down fee by rule type
        List<FeeRule> activeRules = feeRuleRepository.findByActiveTrue();
        double schemeFee = 0.0, interchangeFee = 0.0, acquirerMarkup = 0.0;

        for (FeeRule rule : activeRules) {
            double ruleFee = (amount * rule.getRatePct() / 100) + rule.getFlatFee();
            switch (rule.getRuleType().toUpperCase()) {
                case "SCHEME"      -> schemeFee      += ruleFee;
                case "INTERCHANGE" -> interchangeFee += ruleFee;
                default            -> acquirerMarkup += ruleFee; // MDR, MARKUP
            }
        }

        Txn txn = new Txn();
        txn.setAuthMessage(auth);
        txn.setMerchant(auth.getMerchant());
        txn.setStore(auth.getTerminal().getStore());
        txn.setTerminal(auth.getTerminal());
        txn.setAmount(amount);
        txn.setCurrency(auth.getCurrency());
        txn.setSchemeFee(schemeFee);
        txn.setInterchangeFee(interchangeFee);
        txn.setAcquirerMarkup(acquirerMarkup);
        txn.setTotalFee(totalFee);
        txn.setNetMerchantAmount(amount - totalFee);
        txn.setStatus(TxnStatus.APPROVED);

        Txn saved = txnRepository.save(txn);
        log.info("Txn created: id={}, amount={}, fee={}, net={}",
                saved.getTxnId(), amount, totalFee, saved.getNetMerchantAmount());

        return toTxnResponse(saved);
    }

    // ── GET ALL TXNS ─────────────────────────
        public PagedResponseDTO<TxnResponseDTO> getAllTxns(int page, int size, String sortBy) {
        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<Txn> txnPage = txnRepository.findAll(pageRequest);
        Page<TxnResponseDTO> dtoPage = txnPage.map(this::toTxnResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    // ── GET TXNS BY MERCHANT ─────────────────
        public PagedResponseDTO<TxnResponseDTO> getTxnsByMerchant(
            Long merchantId, int page, int size) {

        Merchant merchant = merchantService.getEntityById(merchantId);

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "txnDate")
        );

        Page<Txn> txnPage = txnRepository.findByMerchant(merchant, pageRequest);
        Page<TxnResponseDTO> dtoPage = txnPage.map(this::toTxnResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<TxnResponseDTO> searchTxns(
            TxnFilterDTO filter, int page, int size, String sortBy) {

        TxnStatus statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
            statusEnum = TxnStatus.valueOf(filter.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid status: " + filter.getStatus() +
                    ". Valid: APPROVED, REVERSED, DISPUTED");
            }
        }

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, sortBy)
        );

        Page<Txn> txnPage = txnRepository.findByFiltersPaged(
            statusEnum,
            filter.getSettled(),
            filter.getMinAmount(),
            filter.getMaxAmount(),
            filter.getFromDate(),
            filter.getToDate(),
            filter.getMerchantId(),
            filter.getTerminalId(),
            filter.getCurrency(),
            pageRequest
        );

        log.info("Txn search: filters={}, page={}, size={}, total={}",
            filter, page, size, txnPage.getTotalElements());

        Page<TxnResponseDTO> dtoPage = txnPage.map(this::toTxnResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public FeeSummaryDTO getFeeSummary(Long merchantId) {
        Merchant merchant = merchantService.getEntityById(merchantId);

        int totalCount = txnRepository.findByMerchant(merchant).size();
        long settledCount = txnRepository.countSettledByMerchant(merchantId);
        long unsettledCount = txnRepository.countUnsettledByMerchant(merchantId);

        double totalGross = value(txnRepository.sumAmountByMerchant(merchantId));
        double totalScheme = value(txnRepository.sumSchemeFeeByMerchant(merchantId));
        double totalInterchange = value(txnRepository.sumInterchangeFeeByMerchant(merchantId));
        double totalMarkup = value(txnRepository.sumAcquirerMarkupByMerchant(merchantId));
        double totalFees = value(txnRepository.sumTotalFeeByMerchant(merchantId));
        double totalNet = totalGross - totalFees;

        double avgFeePct = totalGross > 0
            ? Math.round((totalFees / totalGross * 100) * 100.0) / 100.0
            : 0.0;

        log.info("Fee summary generated: merchantId={}, gross={}, fees={}, net={}",
            merchantId, totalGross, totalFees, totalNet);

        return new FeeSummaryDTO(
            merchantId,
            merchant.getLegalName(),
            totalCount,
            (int) settledCount,
            (int) unsettledCount,
            round(totalGross),
            round(totalScheme),
            round(totalInterchange),
            round(totalMarkup),
            round(totalFees),
            round(totalNet),
            avgFeePct
        );
    }

    // ── MAPPERS ──────────────────────────────
    private FeeRuleResponseDTO toFeeRuleResponse(FeeRule rule) {
        FeeRuleResponseDTO r = new FeeRuleResponseDTO();
        r.setFeeRuleId(rule.getFeeRuleId());
        r.setRuleType(rule.getRuleType());
        r.setDescription(rule.getDescription());
        r.setRatePct(rule.getRatePct());
        r.setFlatFee(rule.getFlatFee());
        r.setEffectiveFrom(rule.getEffectiveFrom());
        r.setEffectiveTo(rule.getEffectiveTo());
        r.setActive(rule.getActive());
        return r;
    }

    private TxnResponseDTO toTxnResponse(Txn txn) {
        TxnResponseDTO r = new TxnResponseDTO();
        r.setTxnId(txn.getTxnId());
        r.setAmount(txn.getAmount());
        r.setCurrency(txn.getCurrency());
        r.setSchemeFee(txn.getSchemeFee());
        r.setInterchangeFee(txn.getInterchangeFee());
        r.setAcquirerMarkup(txn.getAcquirerMarkup());
        r.setTotalFee(txn.getTotalFee());
        r.setNetMerchantAmount(txn.getNetMerchantAmount());
        r.setStatus(txn.getStatus() != null ? txn.getStatus().name() : null);
        r.setSettled(txn.isSettled());
        r.setTxnDate(txn.getTxnDate());
        if (txn.getAuthMessage() != null)
            r.setAuthId(txn.getAuthMessage().getAuthId());
        if (txn.getMerchant() != null) {
            r.setMerchantId(txn.getMerchant().getMerchantId());
            r.setMerchantName(txn.getMerchant().getLegalName());
        }
        if (txn.getStore() != null) {
            r.setStoreId(txn.getStore().getStoreId());
            r.setStoreName(txn.getStore().getStoreName());
        }
        if (txn.getTerminal() != null) {
            r.setTerminalId(txn.getTerminal().getTerminalId());
            r.setTid(txn.getTerminal().getTid());
        }
        return r;
    }

    private double value(Double value) {
        return value == null ? 0.0 : value;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
