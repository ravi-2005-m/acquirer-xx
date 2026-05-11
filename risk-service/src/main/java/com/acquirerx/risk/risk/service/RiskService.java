package com.acquirerx.risk.risk.service;

import com.acquirerx.risk.common.dto.PagedResponseDTO;
import com.acquirerx.risk.common.exception.ResourceNotFoundException;
import com.acquirerx.risk.common.pagination.PaginationParams;
import com.acquirerx.risk.common.util.MaskingUtil;
import com.acquirerx.risk.risk.dto.*;
import com.acquirerx.risk.risk.entity.Blacklist;
import com.acquirerx.risk.risk.entity.RiskEvent;
import com.acquirerx.risk.risk.entity.RiskRule;
import com.acquirerx.risk.risk.repository.BlacklistRepository;
import com.acquirerx.risk.risk.repository.RiskEventRepository;
import com.acquirerx.risk.risk.repository.RiskRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskService {

    private static final Set<String> RULE_SORT_FIELDS = Set.of(
            "riskRuleId", "name", "maxAmount", "severity"
    );
    private static final Set<String> EVENT_SORT_FIELDS = Set.of(
            "riskEventId", "txnId", "score", "result", "eventDate"
    );
    private static final Set<String> BLACKLIST_SORT_FIELDS = Set.of(
            "blacklistId", "type", "value", "createdAt"
    );

    private final RiskRuleRepository riskRuleRepository;
    private final RiskEventRepository riskEventRepository;
    private final BlacklistRepository blacklistRepository;

    // ── CHECK RISK (called by transaction-service via Feign) ──
    public RiskCheckResultDTO checkRisk(Double amount, String panMasked, String tid) {

        if (tid != null) {
            Optional<Blacklist> terminalBlacklist =
                    blacklistRepository.findByTypeAndValueAndActiveTrue("TERMINAL", tid);
            if (terminalBlacklist.isPresent()) {
                log.warn("Blacklisted terminal: {}", tid);
                return new RiskCheckResultDTO("BLOCK", 100, "Terminal is blacklisted");
            }
        }

        if (panMasked != null) {
            String normalizedPan = MaskingUtil.maskPan(panMasked);
            Optional<Blacklist> panBlacklist =
                    blacklistRepository.findByTypeAndValueAndActiveTrue("PAN", normalizedPan);
            if (panBlacklist.isPresent()) {
                log.warn("Blacklisted PAN attempted");
                return new RiskCheckResultDTO("BLOCK", 100, "Card is blacklisted");
            }
        }

        List<RiskRule> activeRules = riskRuleRepository.findByActiveTrue();

        String worstResult = "ALLOW";
        int highestScore = 0;
        String reason = "All checks passed";

        for (RiskRule rule : activeRules) {
            if (rule.getMaxAmount() != null
                    && BigDecimal.valueOf(amount).compareTo(rule.getMaxAmount()) > 0) {
                int score = calculateScore(amount, rule.getMaxAmount().doubleValue());

                if (isMoreSevere(rule.getAction(), worstResult)) {
                    worstResult = rule.getAction();
                    highestScore = score;
                    reason = "Rule triggered: " + rule.getName()
                            + " (amount " + amount
                            + " exceeds limit " + rule.getMaxAmount() + ")";
                }
            }
        }

        log.info("Risk check: amount={}, result={}, score={}", amount, worstResult, highestScore);
        return new RiskCheckResultDTO(worstResult, highestScore, reason);
    }

    // ── EVALUATE AND SAVE (called after transaction) ──
    public void evaluateAndSave(Long txnId, Double amount) {

        List<RiskRule> activeRules = riskRuleRepository.findByActiveTrue();

        for (RiskRule rule : activeRules) {
            if (rule.getMaxAmount() != null
                    && BigDecimal.valueOf(amount).compareTo(rule.getMaxAmount()) > 0) {
                RiskEvent event = new RiskEvent();
                event.setTxnId(txnId);
                event.setRule(rule);
                event.setScore(calculateScore(amount, rule.getMaxAmount().doubleValue()));
                event.setResult(rule.getAction());
                riskEventRepository.save(event);
                log.info("Risk event saved: txnId={}, rule={}, result={}",
                        txnId, rule.getName(), rule.getAction());
            }
        }
    }

    // ── CREATE RULE ───────────────────────────
    public RiskRuleResponseDTO createRule(RiskRuleRequestDTO dto) {
        RiskRule rule = new RiskRule();
        rule.setName(dto.getName());
        rule.setExpression(dto.getExpression());
        rule.setMaxAmount(dto.getMaxAmount());
        rule.setSeverity(dto.getSeverity());
        rule.setAction(dto.getAction());
        rule.setActive(true);

        RiskRule saved = riskRuleRepository.save(rule);
        log.info("Risk rule created: id={}, name={}", saved.getRiskRuleId(), saved.getName());
        return toRuleResponse(saved);
    }

    // ── DEACTIVATE RULE ───────────────────────
    public RiskRuleResponseDTO deactivateRule(Long ruleId) {
        RiskRule rule = riskRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));
        rule.setActive(false);
        return toRuleResponse(riskRuleRepository.save(rule));
    }

    // ── BLACKLIST CRUD ────────────────────────
    public BlacklistResponseDTO addToBlacklist(BlacklistRequestDTO dto) {
        String normalizedValue = "PAN".equalsIgnoreCase(dto.getType())
            ? MaskingUtil.maskPan(dto.getValue())
            : dto.getValue();

        blacklistRepository.findByTypeAndValueAndActiveTrue(dto.getType(), normalizedValue)
                .ifPresent(b -> {
                    throw new IllegalStateException(
                    dto.getType() + " already blacklisted");
                });

        Blacklist entry = new Blacklist();
        entry.setType(dto.getType());
        entry.setValue(normalizedValue);
        entry.setReason(dto.getReason());

        Blacklist saved = blacklistRepository.save(entry);
        log.info("Blacklist added: type={}", dto.getType());
        return toBlacklistResponse(saved);
    }

    public BlacklistResponseDTO removeFromBlacklist(Long blacklistId) {
        Blacklist entry = blacklistRepository.findById(blacklistId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Blacklist entry not found: " + blacklistId));
        entry.setActive(false);
        return toBlacklistResponse(blacklistRepository.save(entry));
    }

    // ── GET METHODS (paged) ───────────────────
    public PagedResponseDTO<RiskEventResponseDTO> getAllRiskEvents(PaginationParams pagination) {
        pagination.validateSortField(EVENT_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<RiskEvent> eventPage = riskEventRepository.findAll(pageable);
        return new PagedResponseDTO<>(eventPage.map(this::toEventResponse));
    }

    public PagedResponseDTO<RiskEventResponseDTO> searchRiskEvents(RiskEventFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(EVENT_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<RiskEvent> eventPage = riskEventRepository.findByFiltersPaged(
                filter.getResult(), filter.getMinScore(), filter.getMaxScore(),
                filter.getFromDate(), filter.getToDate(),
                filter.getTxnId(), filter.getRuleId(), pageable);
        return new PagedResponseDTO<>(eventPage.map(this::toEventResponse));
    }

    public PagedResponseDTO<BlacklistResponseDTO> getActiveBlacklist(String type, PaginationParams pagination) {
        pagination.validateSortField(BLACKLIST_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<Blacklist> blPage;
        if (type != null && !type.isBlank()) {
            blPage = blacklistRepository.findByTypeAndActiveTrue(type, pageable);
        } else {
            blPage = blacklistRepository.findByActiveTrue(pageable);
        }
        return new PagedResponseDTO<>(blPage.map(this::toBlacklistResponse));
    }

    public PagedResponseDTO<RiskRuleResponseDTO> getActiveRules(PaginationParams pagination) {
        pagination.validateSortField(RULE_SORT_FIELDS);
        Pageable pageable = pagination.toPageable();
        Page<RiskRule> rulePage = riskRuleRepository.findByActiveTrue(pageable);
        return new PagedResponseDTO<>(rulePage.map(this::toRuleResponse));
    }

    // ── RISK SUMMARY ──────────────────────────
    public RiskSummaryDTO getRiskSummary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long totalEvents  = riskEventRepository.count();
        long totalBlocked = riskEventRepository.countByResult("BLOCK");
        long totalReview  = riskEventRepository.countByResult("REVIEW");
        long totalAllow   = riskEventRepository.countByResult("ALLOW");

        long todayEvents  = riskEventRepository.countByDateAfter(todayStart);
        long todayBlocked = riskEventRepository.countByResultAndDateAfter("BLOCK", todayStart);
        long todayReview  = riskEventRepository.countByResultAndDateAfter("REVIEW", todayStart);
        long todayAllow   = todayEvents - todayBlocked - todayReview;

        long blacklistEntries = blacklistRepository.countByTypeAndActiveTrue("PAN")
                + blacklistRepository.countByTypeAndActiveTrue("TERMINAL")
                + blacklistRepository.countByTypeAndActiveTrue("MERCHANT");

        long activeRules   = riskRuleRepository.countByActiveTrue();
        long inactiveRules = riskRuleRepository.count() - activeRules;

        double allowRate  = totalEvents > 0 ? (double) totalAllow   / totalEvents : 0.0;
        double reviewRate = totalEvents > 0 ? (double) totalReview   / totalEvents : 0.0;
        double blockRate  = totalEvents > 0 ? (double) totalBlocked  / totalEvents : 0.0;

        return new RiskSummaryDTO(
                todayEvents, todayAllow, todayReview, todayBlocked, null,
                totalEvents, allowRate, reviewRate, blockRate,
                activeRules, inactiveRules, blacklistEntries
        );
    }

    // ── HELPERS ───────────────────────────────
    private int calculateScore(double amount, double maxAmount) {
        double ratio = amount / maxAmount;
        return (int) Math.min(ratio * 50, 100);
    }

    private boolean isMoreSevere(String a, String b) {
        return severityScore(a) > severityScore(b);
    }

    private int severityScore(String action) {
        return switch (action.toUpperCase()) {
            case "BLOCK" -> 3;
            case "REVIEW" -> 2;
            case "ALLOW" -> 1;
            default -> 0;
        };
    }

    // ── MAPPERS ───────────────────────────────
    private RiskRuleResponseDTO toRuleResponse(RiskRule r) {
        RiskRuleResponseDTO dto = new RiskRuleResponseDTO();
        dto.setRiskRuleId(r.getRiskRuleId());
        dto.setName(r.getName());
        dto.setExpression(r.getExpression());
        dto.setMaxAmount(r.getMaxAmount());
        dto.setSeverity(r.getSeverity());
        dto.setAction(r.getAction());
        dto.setActive(r.getActive());
        return dto;
    }

    private RiskEventResponseDTO toEventResponse(RiskEvent e) {
        RiskEventResponseDTO dto = new RiskEventResponseDTO();
        dto.setRiskEventId(e.getRiskEventId());
        dto.setTxnId(e.getTxnId());
        dto.setScore(e.getScore());
        dto.setResult(e.getResult());
        dto.setEventDate(e.getEventDate());
        if (e.getRule() != null) {
            dto.setRuleId(e.getRule().getRiskRuleId());
            dto.setRuleName(e.getRule().getName());
        }
        return dto;
    }

    private BlacklistResponseDTO toBlacklistResponse(Blacklist b) {
        BlacklistResponseDTO dto = new BlacklistResponseDTO();
        dto.setBlacklistId(b.getBlacklistId());
        dto.setType(b.getType());
        dto.setValue(b.getValue());
        dto.setReason(b.getReason());
        dto.setActive(b.getActive());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
