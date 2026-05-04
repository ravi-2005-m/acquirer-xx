package com.acquirerx.terminal.terminal.repository;

import com.acquirerx.terminal.common.enums.Status;
import com.acquirerx.terminal.terminal.entity.Terminal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TerminalRepository extends JpaRepository<Terminal, Long> {

	Page<Terminal> findAll(Pageable pageable);

	List<Terminal> findByStoreId(Long storeId);

	Page<Terminal> findByStoreId(Long storeId, Pageable pageable);

	List<Terminal> findByStatus(Status status);

	Page<Terminal> findByStatus(Status status, Pageable pageable);

	@Query("SELECT t FROM Terminal t WHERE " +
			"(:tid IS NULL OR LOWER(t.tid) LIKE LOWER(CONCAT('%', :tid, '%'))) AND " +
			"(:brandModel IS NULL OR LOWER(t.brandModel) LIKE LOWER(CONCAT('%', :brandModel, '%'))) AND " +
			"(:capability IS NULL OR LOWER(t.capability) = LOWER(:capability)) AND " +
			"(:status IS NULL OR t.status = :status) AND " +
			"(:storeId IS NULL OR t.storeId = :storeId) AND " +
			"(:merchantId IS NULL OR t.merchantId = :merchantId)")
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

	Optional<Terminal> findByTid(String tid);

	boolean existsByTid(String tid);
}
