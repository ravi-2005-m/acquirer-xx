package com.acquirerx.backend.reconciliation.repository;

import com.acquirerx.backend.reconciliation.entity.ExceptionCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ExceptionCaseRepository extends JpaRepository<ExceptionCase, Long> {
	Page<ExceptionCase> findAll(Pageable pageable);

	List<ExceptionCase> findByStatus(String status);

	Page<ExceptionCase> findByStatus(String status, Pageable pageable);

	List<ExceptionCase> findByCategory(String category);

	@Query("SELECT e FROM ExceptionCase e WHERE " +
			"(:category IS NULL OR e.category = :category) AND " +
			"(:status IS NULL OR e.status = :status)")
	Page<ExceptionCase> findByFiltersPaged(
			@Param("category") String category,
			@Param("status") String status,
			Pageable pageable);

	Long countByStatus(String status);

	Long countByCategory(String category);

	@Query("SELECT COUNT(e) FROM ExceptionCase e WHERE e.createdAt >= :fromDate")
	Long countCreatedAfter(@Param("fromDate") LocalDateTime fromDate);
}
