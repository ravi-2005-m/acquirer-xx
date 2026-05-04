package com.acquirerx.backend.settlement.repository;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.settlement.entity.SettlementBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SettlementBatchRepository extends JpaRepository<SettlementBatch, Long> {
	Page<SettlementBatch> findAll(Pageable pageable);

	List<SettlementBatch> findByMerchant(Merchant merchant);

	Page<SettlementBatch> findByMerchant(Merchant merchant, Pageable pageable);

	List<SettlementBatch> findByStatus(String status);

	List<SettlementBatch> findByMerchantAndStatus(Merchant merchant, String status);

	@Query("SELECT s FROM SettlementBatch s WHERE " +
			"(:status IS NULL OR s.status = :status) AND " +
			"(:merchantId IS NULL OR s.merchant.merchantId = :merchantId) AND " +
			"(:minNetAmount IS NULL OR s.netAmount >= :minNetAmount) AND " +
			"(:maxNetAmount IS NULL OR s.netAmount <= :maxNetAmount) AND " +
			"(:fromDate IS NULL OR s.periodStart >= :fromDate) AND " +
			"(:toDate IS NULL OR s.periodEnd <= :toDate) AND " +
			"(:minTxnCount IS NULL OR s.txnCount >= :minTxnCount)")
	Page<SettlementBatch> findByFiltersPaged(
			@Param("status") String status,
			@Param("merchantId") Long merchantId,
			@Param("minNetAmount") Double minNetAmount,
			@Param("maxNetAmount") Double maxNetAmount,
			@Param("fromDate") LocalDateTime fromDate,
			@Param("toDate") LocalDateTime toDate,
			@Param("minTxnCount") Integer minTxnCount,
			Pageable pageable);

	@Query("SELECT SUM(s.grossAmount) FROM SettlementBatch s WHERE s.merchant.merchantId = :merchantId")
	Double sumGrossByMerchant(@Param("merchantId") Long merchantId);

	@Query("SELECT SUM(s.totalFees) FROM SettlementBatch s WHERE s.merchant.merchantId = :merchantId")
	Double sumFeesByMerchant(@Param("merchantId") Long merchantId);

	@Query("SELECT SUM(s.netAmount) FROM SettlementBatch s WHERE s.merchant.merchantId = :merchantId")
	Double sumNetByMerchant(@Param("merchantId") Long merchantId);

	@Query("SELECT SUM(s.netAmount) FROM SettlementBatch s WHERE s.merchant.merchantId = :merchantId AND s.status = 'READY'")
	Double sumPendingPayoutByMerchant(@Param("merchantId") Long merchantId);

	@Query("SELECT COUNT(s) FROM SettlementBatch s WHERE s.merchant.merchantId = :merchantId AND (:status IS NULL OR s.status = :status)")
	Long countByMerchantAndStatus(@Param("merchantId") Long merchantId, @Param("status") String status);
}
