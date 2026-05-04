package com.acquirerx.transaction.fee.service;

import com.acquirerx.transaction.fee.entity.FeeRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeeRuleMatcherTest {

    private FeeRuleMatcher matcher;

    @BeforeEach
    void setUp() {
        matcher = new FeeRuleMatcher();
    }

    @Test
    void matches_shouldReturnTrue_whenAllCriteriaNull() {
        FeeRule rule = new FeeRule();
        rule.setStatus("ACTIVE");

        assertTrue(matcher.matches(rule, "5411", "NA", new BigDecimal("100"), "V"));
    }

    @Test
    void matches_shouldReturnFalse_whenMccDifferent() {
        FeeRule rule = new FeeRule();
        rule.setStatus("ACTIVE");
        rule.setMccPattern("5411");

        assertFalse(matcher.matches(rule, "5812", "NA", new BigDecimal("100"), "V"));
    }

    @Test
    void matches_shouldReturnTrue_whenMccWildcard() {
        FeeRule rule = new FeeRule();
        rule.setStatus("ACTIVE");
        rule.setMccPattern("54*");

        assertTrue(matcher.matches(rule, "5411", "NA", new BigDecimal("100"), "V"));
        assertTrue(matcher.matches(rule, "5499", "NA", new BigDecimal("100"), "V"));
        assertFalse(matcher.matches(rule, "6011", "NA", new BigDecimal("100"), "V"));
    }

    @Test
    void matches_shouldReturnFalse_whenAmountBelowMin() {
        FeeRule rule = new FeeRule();
        rule.setStatus("ACTIVE");
        rule.setMinAmount(new BigDecimal("10"));

        assertFalse(matcher.matches(rule, "5411", "NA", new BigDecimal("5"), "V"));
        assertTrue(matcher.matches(rule, "5411", "NA", new BigDecimal("10"), "V"));
        assertTrue(matcher.matches(rule, "5411", "NA", new BigDecimal("100"), "V"));
    }

    @Test
    void matches_shouldReturnFalse_whenRuleInactive() {
        FeeRule rule = new FeeRule();
        rule.setStatus("INACTIVE");

        assertFalse(matcher.matches(rule, "5411", "NA", new BigDecimal("100"), "V"));
    }

    @Test
    void matches_shouldReturnFalse_whenExpired() {
        FeeRule rule = new FeeRule();
        rule.setStatus("ACTIVE");
        rule.setEffectiveTo(LocalDateTime.now().minusDays(1));

        assertFalse(matcher.matches(rule, "5411", "NA", new BigDecimal("100"), "V"));
    }
}
