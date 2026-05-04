package com.acquirerx.merchant.merchant.repository;

import com.acquirerx.merchant.common.enums.RiskLevel;
import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.merchant.entity.Merchant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MerchantRepository extends JpaRepository<Merchant, Long> {

	Page<Merchant> findAll(Pageable pageable);

	List<Merchant> findByStatus(Status status);

	Page<Merchant> findByStatus(Status status, Pageable pageable);

	@Query("SELECT m FROM Merchant m WHERE " +
			"(:legalName IS NULL OR LOWER(m.legalName) LIKE LOWER(CONCAT('%', :legalName, '%'))) AND " +
			"(:mcc IS NULL OR m.mcc = :mcc) AND " +
			"(:status IS NULL OR m.status = :status) AND " +
			"(:riskLevel IS NULL OR m.riskLevel = :riskLevel) AND " +
			"(:contactInfo IS NULL OR LOWER(m.contactInfo) LIKE LOWER(CONCAT('%', :contactInfo, '%')))")
	Page<Merchant> findByFiltersPaged(
			@Param("legalName") String legalName,
			@Param("mcc") String mcc,
			@Param("status") Status status,
			@Param("riskLevel") RiskLevel riskLevel,
			@Param("contactInfo") String contactInfo,
			Pageable pageable);

	Long countByStatus(Status status);

	Long countByRiskLevel(RiskLevel riskLevel);

	boolean existsByLegalName(String legalName);
}
