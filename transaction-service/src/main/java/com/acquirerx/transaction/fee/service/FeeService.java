package com.acquirerx.transaction.fee.service;

import com.acquirerx.transaction.common.dto.PagedResponseDTO;
import com.acquirerx.transaction.common.exception.ResourceNotFoundException;
import com.acquirerx.transaction.common.pagination.PaginationParams;
import com.acquirerx.transaction.client.MerchantServiceClient;
import com.acquirerx.transaction.fee.dto.*;
import com.acquirerx.transaction.fee.entity.FeeRule;
import com.acquirerx.transaction.fee.entity.Txn;
import com.acquirerx.transaction.fee.repository.FeeRuleRepository;
import com.acquirerx.transaction.fee.repository.TxnRepository;
import com.acquirerx.transaction.switchmodule.entity.AuthMessage;
import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import com.acquirerx.transaction.switchmodule.repository.AuthMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeeService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "txnId", "amount", "totalFee", "merchantId", "terminalId", "txnDate"
    );

    private final FeeRuleRepository feeRuleRepo;
    private final TxnRepository txnRepo;
    private final AuthMessageRepository authRepo;
    private final MerchantServiceClient merchantClient;
    private final FeeRuleMatcher ruleMatcher;

    // CREATE FEE RULE
    public FeeRuleResponseDTO createFeeRule(FeeRuleRequestDTO dto) {
        if (feeRuleRepo.existsByCardTypeAndTransactionType(dto.getCardType(), dto.getTransactionType())) {
            throw new IllegalArgumentException(
                    "Fee rule already exists for " + dto.getCardType() + " / " + dto.getTransactionType());
        }

        FeeRule rule = new FeeRule();
        rule.setCardType(dto.getCardType());
        rule.setTransactionType(dto.getTransactionType());
        rule.setSchemePercentage(dto.getSchemePercentage());
        rule.setInterchangePercentage(dto.getInterchangePercentage());
        rule.setAcquirerMarkupPercentage(dto.getAcquirerMarkupPercentage());
        rule.setMccPattern(dto.getMccPattern());
        rule.setRegion(dto.getRegion());
        rule.setMinAmount(dto.getMinAmount());
        rule.setMaxAmount(dto.getMaxAmount());
        rule.setNetwork(dto.getNetwork());
        Integer priority = dto.getPriority();
        if (priority == null) {
            priority = 100;
        }
        rule.setPriority(priority);
        rule.setEffectiveFrom(dto.getEffectiveFrom());
        rule.setEffectiveTo(dto.getEffectiveTo());
        rule.setStatus("ACTIVE");

        FeeRule saved = feeRuleRepo.save(rule);
        log.info("Fee rule created: id={}, cardType={}, txnType={}",
                 saved.getFeeRuleId(), saved.getCardType(), saved.getTransactionType());
        return toFeeRuleResponse(saved);
    }

    // UPDATE FEE RULE
    public FeeRuleResponseDTO updateFeeRule(Long feeRuleId, FeeRuleRequestDTO dto) {
        FeeRule rule = feeRuleRepo.findById(feeRuleId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee rule not found: " + feeRuleId));

        rule.setSchemePercentage(dto.getSchemePercentage());
        rule.setInterchangePercentage(dto.getInterchangePercentage());
        rule.setAcquirerMarkupPercentage(dto.getAcquirerMarkupPercentage());
        rule.setMccPattern(dto.getMccPattern());
        rule.setRegion(dto.getRegion());
        rule.setMinAmount(dto.getMinAmount());
        rule.setMaxAmount(dto.getMaxAmount());
        rule.setNetwork(dto.getNetwork());
        if (dto.getPriority() != null) {
            rule.setPriority(dto.getPriority());
        }
        rule.setEffectiveFrom(dto.getEffectiveFrom());
        rule.setEffectiveTo(dto.getEffectiveTo());

        FeeRule saved = feeRuleRepo.save(rule);
        log.info("Fee rule updated: id={}", feeRuleId);
        return toFeeRuleResponse(saved);
    }

    // GET ALL FEE RULES
    public List<FeeRuleResponseDTO> getAllFeeRules() {
        return feeRuleRepo.findAll().stream()
                .map(this::toFeeRuleResponse)
                .toList();
    }

    // GET ACTIVE FEE RULES
    public List<FeeRuleResponseDTO> getActiveFeeRules() {
        return feeRuleRepo.findByStatus("ACTIVE").stream()
                .map(this::toFeeRuleResponse)
                .toList();
    }

    // CREATE TXN FROM AUTH
    public TxnResponseDTO createTxnFromAuth(Long authId) {
        AuthMessage auth = authRepo.findById(authId)
                .orElseThrow(() -> new ResourceNotFoundException("Auth message not found: " + authId));

        if (auth.getStatus() != TxnStatus.APPROVED) {
            throw new IllegalStateException("Cannot create Txn from non-APPROVED auth: " + authId);
        }

        String mcc = auth.getMerchantMcc();
        String region = auth.getMerchantRegion();
        String network = auth.getNetwork();

        if (mcc == null && auth.getMerchantId() != null) {
            try {
                Map<String, Object> merchantResp = merchantClient.getMerchantById(auth.getMerchantId());
                Map<String, Object> merchantData = (Map<String, Object>) merchantResp.get("data");
                if (merchantData == null) {
                    merchantData = merchantResp;
                }
                Object mccObj = merchantData.get("mcc");
                Object regionObj = merchantData.get("region");
                mcc = mccObj != null ? mccObj.toString() : null;
                region = regionObj != null ? regionObj.toString() : "NA";
            } catch (Exception ex) {
                log.warn("Could not enrich merchant context for merchantId={}: {}", auth.getMerchantId(), ex.getMessage());
            }
        }

        FeeBreakdownDTO fees = calculateFees(BigDecimal.valueOf(auth.getAmount()), mcc, region, network);

        // Create Txn
        Txn txn = new Txn();
        txn.setAuthId(authId);
        txn.setMerchantId(auth.getMerchantId());
        txn.setTerminalId(auth.getTerminalId());
        txn.setMerchantName(auth.getMerchantName());
        txn.setTid(auth.getTid());
        txn.setAmount(auth.getAmount());
        txn.setCurrency(auth.getCurrency());
        txn.setSchemeFee(fees.getSchemeFee());
        txn.setInterchangeFee(fees.getInterchangeFee());
        txn.setAcquirerMarkup(fees.getAcquirerMarkup());
        txn.setTotalFee(fees.getTotalFee());
        txn.setNetMerchantAmount(fees.getNetMerchantAmount());
        txn.setStatus(TxnStatus.APPROVED);
        txn.setSettled(false);

        Txn saved = txnRepo.save(txn);
        log.info("Txn created from auth: txnId={}, authId={}, amount={}, totalFee={}",
                 saved.getTxnId(), authId, saved.getAmount(), saved.getTotalFee());
        return toTxnResponse(saved);
    }

    // GET TXN
    public TxnResponseDTO getTxn(Long txnId) {
        Txn txn = txnRepo.findById(txnId)
                .orElseThrow(() -> new ResourceNotFoundException("Txn not found: " + txnId));
        return toTxnResponse(txn);
    }

    public TxnResponseDTO getTxnByAuthId(Long authId) {
        Txn txn = txnRepo.findByAuthId(authId)
                .orElseThrow(() -> new ResourceNotFoundException("Txn not found for authId: " + authId));
        return toTxnResponse(txn);
    }

    // GET ALL TXNS (PAGED)
    public PagedResponseDTO<TxnResponseDTO> getAllTxns(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<Txn> txnPage = txnRepo.findAll(pageable);
        return new PagedResponseDTO<>(txnPage.map(this::toTxnResponse));
    }

    public PagedResponseDTO<TxnResponseDTO> getTxnsByMerchant(Long merchantId, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<Txn> txnPage = txnRepo.findByMerchantId(merchantId, pageable);
        return new PagedResponseDTO<>(txnPage.map(this::toTxnResponse));
    }

    public List<TxnResponseDTO> getAllTxnsForRecon() {
        return txnRepo.findAll().stream().map(this::toTxnResponse).toList();
    }

    // SEARCH TXNS (PAGED)
    public PagedResponseDTO<TxnResponseDTO> searchTxns(TxnFilterDTO filter, PaginationParams pagination) {
        TxnStatus statusEnum = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            statusEnum = TxnStatus.valueOf(filter.getStatus().toUpperCase());
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<Txn> txnPage = txnRepo.findByFiltersPaged(
                statusEnum, filter.getSettled(),
                filter.getMinAmount(), filter.getMaxAmount(),
                filter.getFromDate(), filter.getToDate(),
                filter.getMerchantId(), filter.getTerminalId(),
                filter.getCurrency(),
                pageable);

        return new PagedResponseDTO<>(txnPage.map(this::toTxnResponse));
    }

    // GET FEE SUMMARY FOR MERCHANT
    public FeeSummaryDTO getFeeSummary(Long merchantId) {
        List<Txn> txns = txnRepo.findByMerchantId(merchantId);

        int total = txns.size();
        int settled = (int) txns.stream().filter(Txn::isSettled).count();
        int unsettled = total - settled;

        BigDecimal totalAmount = defaultZero(txnRepo.sumAmountByMerchant(merchantId));
        BigDecimal totalSchemeFee = defaultZero(txnRepo.sumSchemeFeeByMerchant(merchantId));
        BigDecimal totalInterchangeFee = defaultZero(txnRepo.sumInterchangeFeeByMerchant(merchantId));
        BigDecimal totalAcquirerMarkup = defaultZero(txnRepo.sumAcquirerMarkupByMerchant(merchantId));
        BigDecimal totalFees = defaultZero(txnRepo.sumTotalFeeByMerchant(merchantId));

        BigDecimal totalNetAmount = totalAmount.subtract(totalFees);
        Double avgFeePercentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
            ? totalFees.divide(totalAmount, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue()
            : 0.0;

        String merchantName = txns.stream()
                .findFirst()
                .map(Txn::getMerchantName)
                .orElse("Unknown");

        log.info("Fee summary: merchantId={}, total={}, settled={}, totalFees={}",
                 merchantId, total, settled, totalFees);

        return new FeeSummaryDTO(
                merchantId, merchantName,
                total, settled, unsettled,
                totalAmount.doubleValue(), totalSchemeFee.doubleValue(), totalInterchangeFee.doubleValue(), totalAcquirerMarkup.doubleValue(),
                totalFees.doubleValue(), totalNetAmount.doubleValue(), avgFeePercentage);
    }

    public List<TxnResponseDTO> getUnsettledTxns(Long merchantId) {
        return txnRepo.findByMerchantIdAndSettledFalse(merchantId)
                .stream()
                .map(this::toTxnResponse)
                .toList();
    }

    public void markTxnsSettled(Long merchantId) {
        List<Txn> unsettled = txnRepo.findByMerchantIdAndSettledFalse(merchantId);
        unsettled.forEach(txn -> txn.setSettled(true));
        txnRepo.saveAll(unsettled);
        log.info("Marked {} txns as settled for merchant {}", unsettled.size(), merchantId);
    }

    public TxnStatsDTO getTxnStats() {
        long total = txnRepo.count();
        long settled = txnRepo.countBySettled(true);
        long unsettled = txnRepo.countBySettled(false);
        Double settledAmt = txnRepo.sumSettledAmount();
        Double totalFees = txnRepo.sumTotalFee();
        return new TxnStatsDTO(total, settled, unsettled,
                settledAmt != null ? settledAmt : 0.0,
                totalFees != null ? totalFees : 0.0);
    }

    // MAPPERS
    private FeeRuleResponseDTO toFeeRuleResponse(FeeRule rule) {
        FeeRuleResponseDTO r = new FeeRuleResponseDTO();
        r.setFeeRuleId(rule.getFeeRuleId());
        r.setCardType(rule.getCardType());
        r.setTransactionType(rule.getTransactionType());
        r.setSchemePercentage(rule.getSchemePercentage());
        r.setInterchangePercentage(rule.getInterchangePercentage());
        r.setAcquirerMarkupPercentage(rule.getAcquirerMarkupPercentage());
        r.setMccPattern(rule.getMccPattern());
        r.setRegion(rule.getRegion());
        r.setMinAmount(rule.getMinAmount());
        r.setMaxAmount(rule.getMaxAmount());
        r.setNetwork(rule.getNetwork());
        r.setPriority(rule.getPriority());
        r.setEffectiveFrom(rule.getEffectiveFrom());
        r.setEffectiveTo(rule.getEffectiveTo());
        r.setStatus(rule.getStatus());
        r.setCreatedAt(rule.getCreatedAt());
        r.setUpdatedAt(rule.getUpdatedAt());
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
        r.setAuthId(txn.getAuthId());
        r.setMerchantId(txn.getMerchantId());
        r.setMerchantName(txn.getMerchantName());
        r.setTerminalId(txn.getTerminalId());
        r.setTid(txn.getTid());
        return r;
    }

    /**
     * Calculates all 4 fee components per spec section 4.5.
     *
     * @param amount the transaction amount
     * @return FeeBreakdownDTO with all fee components and net merchant amount
     */
    public FeeBreakdownDTO calculateFees(BigDecimal amount, String mcc, String region, String network) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        log.info("Calculating fees: amount={}, mcc={}, region={}, network={}", amount, mcc, region, network);

        List<FeeRule> activeRules = feeRuleRepo.findByStatusOrderByPriorityAsc("ACTIVE");
        List<FeeRule> applicableRules = activeRules.stream()
                .filter(rule -> ruleMatcher.matches(rule, mcc, region, amount, network))
                .toList();

        if (applicableRules.isEmpty()) {
            return FeeBreakdownDTO.empty(amount.setScale(4, RoundingMode.HALF_UP));
        }

        BigDecimal schemeFee = sumPercentageForField(amount, applicableRules, "SCHEME");
        BigDecimal interchangeFee = sumPercentageForField(amount, applicableRules, "INTERCHANGE");
        BigDecimal acquirerMarkup = sumPercentageForField(amount, applicableRules, "MARKUP");

        BigDecimal totalFee = schemeFee
                .add(interchangeFee)
                .add(acquirerMarkup)
                .setScale(4, RoundingMode.HALF_UP);

        BigDecimal netMerchantAmount = amount
                .subtract(totalFee)
                .setScale(4, RoundingMode.HALF_UP);

        return FeeBreakdownDTO.builder()
                .schemeFee(schemeFee)
                .interchangeFee(interchangeFee)
                .acquirerMarkup(acquirerMarkup)
                .totalFee(totalFee)
                .netMerchantAmount(netMerchantAmount)
                .build();
    }

    @Deprecated
    public FeeBreakdownDTO calculateFees(BigDecimal amount) {
        return calculateFees(amount, null, null, null);
    }

    @Deprecated
    public BigDecimal calculateFee(BigDecimal amount) {
        return calculateFees(amount, null, null, null).getTotalFee();
    }

    private BigDecimal sumPercentageForField(BigDecimal amount, List<FeeRule> rules, String field) {
        return rules.stream()
                .map(rule -> {
                    Double pct = switch (field) {
                        case "SCHEME" -> rule.getSchemePercentage();
                        case "INTERCHANGE" -> rule.getInterchangePercentage();
                        default -> rule.getAcquirerMarkupPercentage();
                    };
                    return pct != null ? BigDecimal.valueOf(pct) : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(amount)
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
