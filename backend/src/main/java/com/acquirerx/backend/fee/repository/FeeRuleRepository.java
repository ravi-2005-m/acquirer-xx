package com.acquirerx.backend.fee.repository;

import com.acquirerx.backend.fee.entity.FeeRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRuleRepository extends JpaRepository<FeeRule, Long> {

    List<FeeRule> findByActiveTrue();

    List<FeeRule> findByRuleTypeAndActiveTrue(String ruleType);
}
