package com.acquirerx.settlement.settlement.repository;

import com.acquirerx.settlement.settlement.entity.SettlementBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SettlementBatchRepository extends JpaRepository<SettlementBatch, Long> {

    List<SettlementBatch> findByMerchantId(Long merchantId);

    Page<SettlementBatch> findAll(Pageable pageable);

    Page<SettlementBatch> findByMerchantId(Long merchantId, Pageable pageable);

    @Query("SELECT s FROM SettlementBatch s WHERE " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:merchantId IS NULL OR s.merchantId = :merchantId) AND " +
            "(:minNetAmount IS NULL OR s.netAmount >= :minNetAmount) AND " +
            "(:maxNetAmount IS NULL OR s.netAmount <= :maxNetAmount) AND " +
            "(:fromDate IS NULL OR s.periodStart >= :fromDate) AND " +
            "(:toDate IS NULL OR s.periodEnd <= :toDate) AND " +
            "(:minTxnCount IS NULL OR s.txnCount >= :minTxnCount)")
    Page<SettlementBatch> findByFiltersPaged(
            @Param("status") String status,
            @Param("merchantId") Long merchantId,
            @Param("minNetAmount") BigDecimal minNetAmount,
            @Param("maxNetAmount") BigDecimal maxNetAmount,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("minTxnCount") Integer minTxnCount,
            Pageable pageable);

    @Query("SELECT SUM(s.grossAmount) FROM SettlementBatch s WHERE s.merchantId = :merchantId")
    BigDecimal sumGrossByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(s.totalFees) FROM SettlementBatch s WHERE s.merchantId = :merchantId")
    BigDecimal sumFeesByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(s.netAmount) FROM SettlementBatch s WHERE s.merchantId = :merchantId")
    BigDecimal sumNetByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(s.netAmount) FROM SettlementBatch s WHERE s.merchantId = :merchantId AND s.status = 'READY'")
    BigDecimal sumPendingPayoutByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT COUNT(s) FROM SettlementBatch s WHERE s.merchantId = :merchantId AND s.status = :status")
    Long countByMerchantIdAndStatus(@Param("merchantId") Long merchantId, @Param("status") String status);

    Long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(s.grossAmount), 0) FROM SettlementBatch s")
    BigDecimal sumGrossAmount();

    @Query("SELECT COALESCE(SUM(s.netAmount), 0) FROM SettlementBatch s")
    BigDecimal sumNetAmount();

    @Query("SELECT COALESCE(SUM(s.totalFees), 0) FROM SettlementBatch s")
    BigDecimal sumTotalFees();
}
