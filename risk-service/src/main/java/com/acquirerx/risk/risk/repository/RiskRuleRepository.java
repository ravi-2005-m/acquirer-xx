package com.acquirerx.risk.risk.repository;

import com.acquirerx.risk.risk.entity.RiskRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskRuleRepository extends JpaRepository<RiskRule, Long> {
    List<RiskRule> findByActiveTrue();

    Page<RiskRule> findByActiveTrue(Pageable pageable);

    List<RiskRule> findByActionAndActiveTrue(String action);

    Long countByActionAndActiveTrue(String action);

    Long countByActiveTrue();
}
