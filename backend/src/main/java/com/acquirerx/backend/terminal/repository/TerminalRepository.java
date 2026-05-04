package com.acquirerx.backend.terminal.repository;

import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.store.entity.Store;
import com.acquirerx.backend.terminal.entity.Terminal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TerminalRepository extends JpaRepository<Terminal, Long> {

	Page<Terminal> findAll(Pageable pageable);

	List<Terminal> findByStore(Store store);

	Page<Terminal> findByStore(Store store, Pageable pageable);

	List<Terminal> findByStatus(Status status);

	Page<Terminal> findByStatus(Status status, Pageable pageable);

	@Query("SELECT t FROM Terminal t WHERE " +
			"(:tid IS NULL OR LOWER(t.tid) LIKE LOWER(CONCAT('%', :tid, '%'))) AND " +
			"(:brandModel IS NULL OR LOWER(t.brandModel) LIKE LOWER(CONCAT('%', :brandModel, '%'))) AND " +
			"(:capability IS NULL OR LOWER(t.capability) = LOWER(:capability)) AND " +
			"(:status IS NULL OR t.status = :status) AND " +
			"(:storeId IS NULL OR t.store.storeId = :storeId) AND " +
			"(:merchantId IS NULL OR t.store.merchant.merchantId = :merchantId)")
	Page<Terminal> findByFiltersPaged(
			@Param("tid") String tid,
			@Param("brandModel") String brandModel,
			@Param("capability") String capability,
			@Param("status") Status status,
			@Param("storeId") Long storeId,
			@Param("merchantId") Long merchantId,
			Pageable pageable);

	Long countByStatus(Status status);

	Long countByCapabilityIgnoreCase(String capability);

	@Query("SELECT COUNT(t) FROM Terminal t WHERE LOWER(t.brandModel) LIKE LOWER(CONCAT('%', :brand, '%'))")
	Long countByBrandContaining(@Param("brand") String brand);

	@Query("SELECT COUNT(DISTINCT b.terminal.terminalId) FROM Batch b WHERE b.status = 'OPEN'")
	Long countTerminalsWithOpenBatch();

	@Query("SELECT COUNT(t) FROM Terminal t WHERE t.terminalId NOT IN " +
			"(SELECT DISTINCT b.terminal.terminalId FROM Batch b)")
	Long countTerminalsWithNoBatch();

	Optional<Terminal> findByTid(String tid);

	boolean existsByTid(String tid);
}
