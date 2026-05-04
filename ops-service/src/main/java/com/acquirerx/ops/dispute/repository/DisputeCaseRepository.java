package com.acquirerx.ops.dispute.repository;

import com.acquirerx.ops.common.DisputeStage;
import com.acquirerx.ops.common.DisputeStatus;
import com.acquirerx.ops.dispute.entity.DisputeCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DisputeCaseRepository extends JpaRepository<DisputeCase, Long> {

    Page<DisputeCase> findByStatus(DisputeStatus status, Pageable pageable);

    Page<DisputeCase> findByStage(DisputeStage stage, Pageable pageable);

    @Query("SELECT d FROM DisputeCase d WHERE " +
           "(:stage IS NULL OR d.stage = :stage) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:reasonCode IS NULL OR LOWER(d.reasonCode) LIKE LOWER(CONCAT('%', :reasonCode, '%'))) AND " +
           "(:fromDate IS NULL OR d.openedDate >= :fromDate) AND " +
           "(:toDate IS NULL OR d.openedDate <= :toDate) AND " +
           "(:merchantId IS NULL OR d.merchantId = :merchantId) AND " +
           "(:deadlineExpired IS NULL OR " +
           "  (:deadlineExpired = true AND d.deadline < CURRENT_TIMESTAMP AND d.status = 'OPEN') OR " +
           "  (:deadlineExpired = false AND d.deadline >= CURRENT_TIMESTAMP))")
    Page<DisputeCase> findByFiltersPaged(
            @Param("stage") DisputeStage stage,
            @Param("status") DisputeStatus status,
            @Param("reasonCode") String reasonCode,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("merchantId") Long merchantId,
            @Param("deadlineExpired") Boolean deadlineExpired,
            Pageable pageable);

    Long countByStatus(DisputeStatus status);

    Long countByStageAndStatus(DisputeStage stage, DisputeStatus status);

    @Query("SELECT COUNT(d) FROM DisputeCase d WHERE d.status = 'OPEN' AND d.deadline < CURRENT_TIMESTAMP")
    Long countExpiredDeadlines();

    @Query("SELECT COUNT(d) FROM DisputeCase d WHERE d.status = 'OPEN' " +
           "AND d.deadline >= CURRENT_TIMESTAMP " +
           "AND d.deadline <= :warningDate")
    Long countDeadlineWithinDate(@Param("warningDate") LocalDateTime warningDate);

    @Query("SELECT COUNT(d) FROM DisputeCase d WHERE d.openedDate >= :todayStart")
    Long countOpenedAfter(@Param("todayStart") LocalDateTime todayStart);

    @Query("SELECT COUNT(d) FROM DisputeCase d WHERE d.closedDate >= :todayStart")
    Long countClosedAfter(@Param("todayStart") LocalDateTime todayStart);

       Optional<DisputeCase> findByTxnIdAndStatus(Long txnId, DisputeStatus status);

       List<DisputeCase> findByTxnId(Long txnId);
}


