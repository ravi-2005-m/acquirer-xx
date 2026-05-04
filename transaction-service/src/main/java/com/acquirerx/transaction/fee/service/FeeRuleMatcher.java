package com.acquirerx.transaction.fee.service;

import com.acquirerx.transaction.fee.entity.FeeRule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Component
public class FeeRuleMatcher {

    public boolean matches(FeeRule rule, String mcc, String region,
                           BigDecimal amount, String network) {

        if (rule == null) {
            return false;
        }

        if (!"ACTIVE".equalsIgnoreCase(rule.getStatus())) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        if (rule.getEffectiveFrom() != null && now.isBefore(rule.getEffectiveFrom())) {
            return false;
        }
        if (rule.getEffectiveTo() != null && now.isAfter(rule.getEffectiveTo())) {
            return false;
        }

        if (rule.getMccPattern() != null && !matchesMcc(rule.getMccPattern(), mcc)) {
            return false;
        }

        if (rule.getRegion() != null && (region == null || !rule.getRegion().equalsIgnoreCase(region))) {
            return false;
        }

        if (rule.getMinAmount() != null && amount.compareTo(rule.getMinAmount()) < 0) {
            return false;
        }
        if (rule.getMaxAmount() != null && amount.compareTo(rule.getMaxAmount()) > 0) {
            return false;
        }

        if (rule.getNetwork() != null && (network == null || !rule.getNetwork().equalsIgnoreCase(network))) {
            return false;
        }

        log.debug("Rule matched: id={}, priority={}", rule.getFeeRuleId(), rule.getPriority());
        return true;
    }

    private boolean matchesMcc(String pattern, String mcc) {
        if (mcc == null) {
            return false;
        }

        if (pattern.endsWith("*")) {
            String prefix = pattern.substring(0, pattern.length() - 1);
            return mcc.startsWith(prefix);
        }
        return pattern.equals(mcc);
    }
}
