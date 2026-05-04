package com.acquirerx.backend.risk.repository;

import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.risk.entity.RiskEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {

    Page<RiskEvent> findAll(Pageable pageable);

    List<RiskEvent> findByTxn(Txn txn);

    List<RiskEvent> findByResult(String result);

    @Query("SELECT e FROM RiskEvent e WHERE " +
           "(:result IS NULL OR e.result = :result) AND " +
           "(:minScore IS NULL OR e.score >= :minScore) AND " +
           "(:maxScore IS NULL OR e.score <= :maxScore) AND " +
           "(:fromDate IS NULL OR e.eventDate >= :fromDate) AND " +
           "(:toDate IS NULL OR e.eventDate <= :toDate) AND " +
           "(:txnId IS NULL OR e.txn.txnId = :txnId) AND " +
           "(:ruleId IS NULL OR e.rule.riskRuleId = :ruleId)")
    Page<RiskEvent> findByFiltersPaged(
            @Param("result") String result,
            @Param("minScore") Integer minScore,
            @Param("maxScore") Integer maxScore,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("txnId") Long txnId,
            @Param("ruleId") Long ruleId,
            Pageable pageable);

    Long countByResult(String result);

    @Query("SELECT COUNT(e) FROM RiskEvent e WHERE e.eventDate >= :fromDate AND e.result = :result")
    Long countByResultAndDateAfter(@Param("result") String result,
                                   @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(e) FROM RiskEvent e WHERE e.eventDate >= :fromDate")
    Long countByDateAfter(@Param("fromDate") LocalDateTime fromDate);
}
