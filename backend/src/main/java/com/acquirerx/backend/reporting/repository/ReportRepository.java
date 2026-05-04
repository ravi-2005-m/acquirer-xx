package com.acquirerx.backend.reporting.repository;

import com.acquirerx.backend.reporting.entity.AcquirerReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportRepository extends JpaRepository<AcquirerReport, Long> {

    Page<AcquirerReport> findAll(Pageable pageable);

    List<AcquirerReport> findByScope(String scope);

    Page<AcquirerReport> findByScope(String scope, Pageable pageable);

    List<AcquirerReport> findByScopeAndScopeRefId(String scope, Long scopeRefId);

    @Query("SELECT r FROM AcquirerReport r WHERE " +
           "(:scope IS NULL OR r.scope = :scope) AND " +
           "(:scopeRefId IS NULL OR r.scopeRefId = :scopeRefId) AND " +
           "(:fromDate IS NULL OR r.generatedAt >= :fromDate) AND " +
           "(:toDate IS NULL OR r.generatedAt <= :toDate) AND " +
           "(:minChargebackRate IS NULL OR r.chargebackRate >= :minChargebackRate) AND " +
           "(:maxChargebackRate IS NULL OR r.chargebackRate <= :maxChargebackRate)")
    Page<AcquirerReport> findByFiltersPaged(
            @Param("scope") String scope,
            @Param("scopeRefId") Long scopeRefId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("minChargebackRate") Double minChargebackRate,
            @Param("maxChargebackRate") Double maxChargebackRate,
            Pageable pageable);

    Long countByScope(String scope);

    @Query("SELECT COUNT(r) FROM AcquirerReport r WHERE r.generatedAt >= :fromDate")
    Long countGeneratedAfter(@Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT MAX(r.chargebackRate) FROM AcquirerReport r")
    Double findMaxChargebackRate();

    @Query("SELECT COUNT(r) FROM AcquirerReport r WHERE r.chargebackRate > 1.0")
    Long countAboveChargebackThreshold();
}
