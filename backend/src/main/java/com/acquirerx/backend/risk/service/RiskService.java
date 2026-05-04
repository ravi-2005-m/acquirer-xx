package com.acquirerx.backend.risk.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.risk.dto.BlacklistRequestDTO;
import com.acquirerx.backend.risk.dto.BlacklistResponseDTO;
import com.acquirerx.backend.risk.dto.RiskCheckResultDTO;
import com.acquirerx.backend.risk.dto.RiskEventFilterDTO;
import com.acquirerx.backend.risk.dto.RiskEventResponseDTO;
import com.acquirerx.backend.risk.dto.RiskRuleRequestDTO;
import com.acquirerx.backend.risk.dto.RiskRuleResponseDTO;
import com.acquirerx.backend.risk.dto.RiskSummaryDTO;
import com.acquirerx.backend.risk.entity.Blacklist;
import com.acquirerx.backend.risk.entity.RiskEvent;
import com.acquirerx.backend.risk.entity.RiskRule;
import com.acquirerx.backend.risk.repository.BlacklistRepository;
import com.acquirerx.backend.risk.repository.RiskEventRepository;
import com.acquirerx.backend.risk.repository.RiskRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskService {

    private final RiskRuleRepository riskRuleRepository;
    private final RiskEventRepository riskEventRepository;
    private final BlacklistRepository blacklistRepository;
    private final TxnRepository txnRepository;

    public RiskRuleResponseDTO createRule(RiskRuleRequestDTO dto) {
        RiskRule rule = new RiskRule();
        rule.setName(dto.getName());
        rule.setExpression(dto.getExpression());
        rule.setMaxAmount(dto.getMaxAmount());
        rule.setSeverity(dto.getSeverity());
        rule.setAction(dto.getAction());
        rule.setActive(true);

        RiskRule saved = riskRuleRepository.save(rule);
        log.info("Risk rule created: id={}, name={}, action={}", saved.getRiskRuleId(), saved.getName(), saved.getAction());
        return toRuleResponse(saved);
    }

    public PagedResponseDTO<RiskRuleResponseDTO> getActiveRules(int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "riskRuleId")
        );

        Page<RiskRule> rulePage = riskRuleRepository.findByActiveTrue(pageRequest);
        Page<RiskRuleResponseDTO> dtoPage = rulePage.map(this::toRuleResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public RiskRuleResponseDTO deactivateRule(Long ruleId) {
        RiskRule rule = riskRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Risk rule not found: " + ruleId));
        rule.setActive(false);
        return toRuleResponse(riskRuleRepository.save(rule));
    }

    public RiskCheckResultDTO checkRisk(Double amount, String panMasked, String tid) {
        if (tid != null) {
            Optional<Blacklist> terminalBlacklist =
                    blacklistRepository.findByTypeAndValueAndActiveTrue("TERMINAL", tid);
            if (terminalBlacklist.isPresent()) {
                log.warn("Blacklisted terminal attempted transaction: {}", tid);
                return new RiskCheckResultDTO("BLOCK", 100, "Terminal is blacklisted");
            }
        }

        if (panMasked != null) {
            Optional<Blacklist> panBlacklist =
                    blacklistRepository.findByTypeAndValueAndActiveTrue("PAN", panMasked);
            if (panBlacklist.isPresent()) {
                log.warn("Blacklisted PAN attempted transaction: {}", panMasked);
                return new RiskCheckResultDTO("BLOCK", 100, "Card is blacklisted");
            }
        }

        List<RiskRule> activeRules = riskRuleRepository.findByActiveTrue();

        String worstResult = "ALLOW";
        int highestScore = 0;
        String reason = "All checks passed";

        for (RiskRule rule : activeRules) {
            if (amount != null && rule.getMaxAmount() != null && amount > rule.getMaxAmount()) {
                int score = calculateScore(amount, rule.getMaxAmount());

                if (isMoreSevere(rule.getAction(), worstResult)) {
                    worstResult = rule.getAction();
                    highestScore = score;
                    reason = "Rule triggered: " + rule.getName()
                            + " (amount " + amount + " exceeds limit " + rule.getMaxAmount() + ")";
                }
            }
        }

        log.info("Risk check: amount={}, result={}, score={}", amount, worstResult, highestScore);
        return new RiskCheckResultDTO(worstResult, highestScore, reason);
    }

    public void evaluateAndSave(Long txnId) {
        Txn txn = txnRepository.findById(txnId)
                .orElseThrow(() -> new ResourceNotFoundException("Txn not found: " + txnId));

        List<RiskRule> activeRules = riskRuleRepository.findByActiveTrue();

        for (RiskRule rule : activeRules) {
            if (txn.getAmount() != null && rule.getMaxAmount() != null && txn.getAmount() > rule.getMaxAmount()) {
                RiskEvent event = new RiskEvent();
                event.setTxn(txn);
                event.setRule(rule);
                event.setScore(calculateScore(txn.getAmount(), rule.getMaxAmount()));
                event.setResult(rule.getAction());
                riskEventRepository.save(event);
                log.info("Risk event saved: txn={}, rule={}, result={}", txnId, rule.getName(), rule.getAction());
            }
        }
    }

    public BlacklistResponseDTO addToBlacklist(BlacklistRequestDTO dto) {
        blacklistRepository.findByTypeAndValueAndActiveTrue(dto.getType(), dto.getValue())
                .ifPresent(b -> {
                    throw new IllegalStateException(dto.getType() + " is already blacklisted: " + dto.getValue());
                });

        Blacklist entry = new Blacklist();
        entry.setType(dto.getType());
        entry.setValue(dto.getValue());
        entry.setReason(dto.getReason());

        Blacklist saved = blacklistRepository.save(entry);
        log.info("Blacklisted: type={}, value={}", saved.getType(), saved.getValue());
        return toBlacklistResponse(saved);
    }

    public BlacklistResponseDTO removeFromBlacklist(Long blacklistId) {
        Blacklist entry = blacklistRepository.findById(blacklistId)
                .orElseThrow(() -> new ResourceNotFoundException("Blacklist entry not found: " + blacklistId));
        entry.setActive(false);
        return toBlacklistResponse(blacklistRepository.save(entry));
    }

    public PagedResponseDTO<BlacklistResponseDTO> getActiveBlacklist(String type, int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Blacklist> blacklistPage;

        if (type != null && !type.isBlank()) {
            blacklistPage = blacklistRepository.findByTypeAndActiveTrue(type, pageRequest);
        } else {
            blacklistPage = blacklistRepository.findByActiveTrue(pageRequest);
        }

        Page<BlacklistResponseDTO> dtoPage = blacklistPage.map(this::toBlacklistResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<RiskEventResponseDTO> getAllRiskEvents(int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "eventDate")
        );

        Page<RiskEvent> eventPage = riskEventRepository.findAll(pageRequest);
        Page<RiskEventResponseDTO> dtoPage = eventPage.map(this::toEventResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<RiskEventResponseDTO> searchRiskEvents(
            RiskEventFilterDTO filter, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "eventDate")
        );

        Page<RiskEvent> eventPage = riskEventRepository.findByFiltersPaged(
                filter.getResult(),
                filter.getMinScore(),
                filter.getMaxScore(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getTxnId(),
                filter.getRuleId(),
                pageRequest
        );

        log.info("Risk event search: filters={}, total={}", filter, eventPage.getTotalElements());

        Page<RiskEventResponseDTO> dtoPage = eventPage.map(this::toEventResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public List<RiskEventResponseDTO> getRiskEventsByResult(String result) {
        return riskEventRepository.findByResult(result)
                .stream()
                .map(this::toEventResponse)
                .toList();
    }

        public RiskSummaryDTO getRiskSummary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long totalEvents = riskEventRepository.count();
        long totalBlocked = value(riskEventRepository.countByResult("BLOCK"));
        long totalReview = value(riskEventRepository.countByResult("REVIEW"));
        long totalAllow = value(riskEventRepository.countByResult("ALLOW"));

        long todayEvents = value(riskEventRepository.countByDateAfter(todayStart));
        long todayBlocked = value(riskEventRepository.countByResultAndDateAfter("BLOCK", todayStart));
        long todayReview = value(riskEventRepository.countByResultAndDateAfter("REVIEW", todayStart));

        long panCount = value(blacklistRepository.countByTypeAndActiveTrue("PAN"));
        long terminalCount = value(blacklistRepository.countByTypeAndActiveTrue("TERMINAL"));
        long merchantCount = value(blacklistRepository.countByTypeAndActiveTrue("MERCHANT"));

        long activeRules = value(riskRuleRepository.countByActionAndActiveTrue("BLOCK"))
            + value(riskRuleRepository.countByActionAndActiveTrue("REVIEW"))
            + value(riskRuleRepository.countByActionAndActiveTrue("ALLOW"));
        long blockRules = value(riskRuleRepository.countByActionAndActiveTrue("BLOCK"));
        long reviewRules = value(riskRuleRepository.countByActionAndActiveTrue("REVIEW"));

        double blockRate = totalEvents > 0
            ? Math.round((totalBlocked * 100.0 / totalEvents) * 100.0) / 100.0
            : 0.0;

        log.info("Risk summary: total={}, blocked={}, blockRate={}%",
            totalEvents, totalBlocked, blockRate);

        return new RiskSummaryDTO(
            totalEvents, totalBlocked, totalReview, totalAllow,
            todayEvents, todayBlocked, todayReview,
            panCount, terminalCount, merchantCount,
            activeRules, blockRules, reviewRules,
            blockRate
        );
        }

    private int calculateScore(double amount, double maxAmount) {
        double ratio = amount / maxAmount;
        return (int) Math.min(ratio * 50, 100);
    }

    private boolean isMoreSevere(String actionA, String actionB) {
        int scoreA = severityScore(actionA);
        int scoreB = severityScore(actionB);
        return scoreA > scoreB;
    }

    private int severityScore(String action) {
        if (action == null) {
            return 0;
        }
        return switch (action.toUpperCase()) {
            case "BLOCK" -> 3;
            case "REVIEW" -> 2;
            case "ALLOW" -> 1;
            default -> 0;
        };
    }

    private RiskRuleResponseDTO toRuleResponse(RiskRule rule) {
        RiskRuleResponseDTO dto = new RiskRuleResponseDTO();
        dto.setRiskRuleId(rule.getRiskRuleId());
        dto.setName(rule.getName());
        dto.setExpression(rule.getExpression());
        dto.setMaxAmount(rule.getMaxAmount());
        dto.setSeverity(rule.getSeverity());
        dto.setAction(rule.getAction());
        dto.setActive(rule.getActive());
        return dto;
    }

    private RiskEventResponseDTO toEventResponse(RiskEvent event) {
        RiskEventResponseDTO dto = new RiskEventResponseDTO();
        dto.setRiskEventId(event.getRiskEventId());
        dto.setScore(event.getScore());
        dto.setResult(event.getResult());
        dto.setEventDate(event.getEventDate());
        if (event.getTxn() != null) {
            dto.setTxnId(String.valueOf(event.getTxn().getTxnId()));
            dto.setTxnAmount(event.getTxn().getAmount());
        }
        if (event.getRule() != null) {
            dto.setRuleId(event.getRule().getRiskRuleId());
            dto.setRuleName(event.getRule().getName());
        }
        return dto;
    }

    private BlacklistResponseDTO toBlacklistResponse(Blacklist blacklist) {
        BlacklistResponseDTO dto = new BlacklistResponseDTO();
        dto.setBlacklistId(blacklist.getBlacklistId());
        dto.setType(blacklist.getType());
        dto.setValue(blacklist.getValue());
        dto.setReason(blacklist.getReason());
        dto.setActive(blacklist.getActive());
        dto.setCreatedAt(blacklist.getCreatedAt());
        return dto;
    }

    private long value(Long value) {
        return value == null ? 0L : value;
    }
}
