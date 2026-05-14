package com.acquirerx.transaction.fee.repository;

import com.acquirerx.transaction.fee.entity.FeeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FeeRuleRepository extends JpaRepository<FeeRule, Long> {

    List<FeeRule> findByStatus(String status);

    List<FeeRule> findByStatusOrderByPriorityAsc(String status);

    boolean existsByCardTypeAndTransactionType(String cardType, String transactionType);

    @Query("SELECT r FROM FeeRule r WHERE r.status = 'ACTIVE' " +
           "AND (r.effectiveFrom IS NULL OR r.effectiveFrom <= :now) " +
           "AND (r.effectiveTo IS NULL OR r.effectiveTo >= :now) " +
           "ORDER BY r.priority ASC")
    List<FeeRule> findEffectiveRulesOrderByPriorityAsc(@Param("now") LocalDateTime now);
}
