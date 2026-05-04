package com.acquirerx.ops.reconciliation.repository;

import com.acquirerx.ops.reconciliation.entity.ReconItem;
import com.acquirerx.ops.reconciliation.entity.ReconFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReconItemRepository extends JpaRepository<ReconItem, Long> {
	Page<ReconItem> findAll(Pageable pageable);

	List<ReconItem> findByReconFile(ReconFile reconFile);

	Page<ReconItem> findByReconFile(ReconFile reconFile, Pageable pageable);

	List<ReconItem> findByMatchStatus(String matchStatus);

	Page<ReconItem> findByMatchStatus(String matchStatus, Pageable pageable);

	List<ReconItem> findByReconFileAndMatchStatus(ReconFile reconFile, String matchStatus);

	@Query("SELECT i FROM ReconItem i WHERE " +
			"(:matchStatus IS NULL OR i.matchStatus = :matchStatus) AND " +
			"(:reconFileId IS NULL OR i.reconFile.reconFileId = :reconFileId)")
	Page<ReconItem> findByFiltersPaged(
			@Param("matchStatus") String matchStatus,
			@Param("reconFileId") Long reconFileId,
			Pageable pageable);

	Long countByMatchStatus(String matchStatus);
}


