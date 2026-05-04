package com.acquirerx.backend.reconciliation.repository;

import com.acquirerx.backend.reconciliation.entity.ReconFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReconFileRepository extends JpaRepository<ReconFile, Long> {
	Page<ReconFile> findAll(Pageable pageable);

	List<ReconFile> findBySource(String source);

	List<ReconFile> findByStatus(String status);

	List<ReconFile> findByFileDate(LocalDate fileDate);

	@Query("SELECT r FROM ReconFile r WHERE " +
			"(:source IS NULL OR r.source = :source) AND " +
			"(:status IS NULL OR r.status = :status) AND " +
			"(:fromDate IS NULL OR r.fileDate >= :fromDate) AND " +
			"(:toDate IS NULL OR r.fileDate <= :toDate)")
	Page<ReconFile> findByFiltersPaged(
			@Param("source") String source,
			@Param("status") String status,
			@Param("fromDate") LocalDate fromDate,
			@Param("toDate") LocalDate toDate,
			Pageable pageable);

	Long countByStatus(String status);

	@Query("SELECT COUNT(r) FROM ReconFile r WHERE r.loadedAt >= :fromDate")
	Long countLoadedAfter(@Param("fromDate") LocalDateTime fromDate);
}
