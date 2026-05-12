package com.acquirerx.risk.risk.repository;

import com.acquirerx.risk.risk.entity.RiskEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {

    List<RiskEvent> findByTxnId(Long txnId);

    List<RiskEvent> findByResult(String result);

    @Query("SELECT e FROM RiskEvent e WHERE " +
           "(:result IS NULL OR e.result = :result) AND " +
           "(:pan IS NULL OR e.pan = :pan) AND " +
           "(:minScore IS NULL OR e.score >= :minScore) AND " +
           "(:maxScore IS NULL OR e.score <= :maxScore) AND " +
           "(:fromDate IS NULL OR e.eventDate >= :fromDate) AND " +
           "(:toDate IS NULL OR e.eventDate <= :toDate) AND " +
           "(:txnId IS NULL OR e.txnId = :txnId) AND " +
           "(:ruleId IS NULL OR e.rule.riskRuleId = :ruleId)")
    Page<RiskEvent> findByFiltersPaged(
            @Param("result") String result,
            @Param("pan") String pan,
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
