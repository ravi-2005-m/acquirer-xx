package com.acquirerx.backend.risk.service;

import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.risk.dto.BlacklistRequestDTO;
import com.acquirerx.backend.risk.dto.RiskCheckResultDTO;
import com.acquirerx.backend.risk.entity.Blacklist;
import com.acquirerx.backend.risk.entity.RiskRule;
import com.acquirerx.backend.risk.repository.BlacklistRepository;
import com.acquirerx.backend.risk.repository.RiskEventRepository;
import com.acquirerx.backend.risk.repository.RiskRuleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RiskServiceTest {

    @Mock
    private RiskRuleRepository riskRuleRepository;
    @Mock
    private RiskEventRepository riskEventRepository;
    @Mock
    private BlacklistRepository blacklistRepository;
    @Mock
    private TxnRepository txnRepository;

    @InjectMocks
    private RiskService riskService;

    @Test
    @DisplayName("checkRisk blocks blacklisted terminal")
    void checkRisk_blacklistedTerminal_shouldBlock() {
        Blacklist bl = new Blacklist();
        bl.setType("TERMINAL");
        bl.setValue("TID-007");
        bl.setActive(true);

        when(blacklistRepository.findByTypeAndValueAndActiveTrue("TERMINAL", "TID-007"))
                .thenReturn(Optional.of(bl));

        RiskCheckResultDTO result = riskService.checkRisk(500.0, null, "TID-007");

        assertEquals("BLOCK", result.getResult());
        assertEquals(100, result.getScore());
    }

    @Test
    @DisplayName("checkRisk returns REVIEW when review rule is triggered")
    void checkRisk_reviewRule_shouldReview() {
        RiskRule reviewRule = new RiskRule();
        reviewRule.setName("Medium amount review");
        reviewRule.setMaxAmount(20000.0);
        reviewRule.setAction("REVIEW");

        when(blacklistRepository.findByTypeAndValueAndActiveTrue(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(riskRuleRepository.findByActiveTrue()).thenReturn(List.of(reviewRule));

        RiskCheckResultDTO result = riskService.checkRisk(35000.0, null, "TID-001");

        assertEquals("REVIEW", result.getResult());
    }

    @Test
    @DisplayName("checkRisk allows normal amount with no rules")
    void checkRisk_noRules_shouldAllow() {
        when(blacklistRepository.findByTypeAndValueAndActiveTrue(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(riskRuleRepository.findByActiveTrue()).thenReturn(Collections.emptyList());

        RiskCheckResultDTO result = riskService.checkRisk(500.0, null, "TID-001");

        assertEquals("ALLOW", result.getResult());
        assertEquals(0, result.getScore());
    }

    @Test
    @DisplayName("addToBlacklist rejects duplicates")
    void addToBlacklist_duplicate_shouldThrow() {
        BlacklistRequestDTO dto = new BlacklistRequestDTO();
        dto.setType("PAN");
        dto.setValue("************1234");
        dto.setReason("Fraud");

        Blacklist existing = new Blacklist();
        existing.setBlacklistId(1L);

        when(blacklistRepository.findByTypeAndValueAndActiveTrue("PAN", "************1234"))
                .thenReturn(Optional.of(existing));

        assertThrows(IllegalStateException.class, () -> riskService.addToBlacklist(dto));
    }
}
