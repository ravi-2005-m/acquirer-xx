package com.acquirerx.backend.iam.repository;

import com.acquirerx.backend.iam.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorUsername(String actorUsername, Pageable pageable);

    Page<AuditLog> findByAction(String action, Pageable pageable);

    Page<AuditLog> findByTargetId(String targetId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:actorUsername IS NULL OR a.actorUsername = :actorUsername) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:targetId IS NULL OR a.targetId = :targetId) AND " +
           "(:fromDate IS NULL OR a.performedAt >= :fromDate) AND " +
           "(:toDate IS NULL OR a.performedAt <= :toDate)")
    Page<AuditLog> findByFiltersPaged(
            @Param("actorUsername") String actorUsername,
            @Param("action") String action,
            @Param("targetId") String targetId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);

    Long countByAction(String action);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.performedAt >= :fromDate")
    Long countAfter(@Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = 'LOGIN_FAILED' AND a.performedAt >= :fromDate")
    Long countFailedLoginsAfter(@Param("fromDate") LocalDateTime fromDate);
}
