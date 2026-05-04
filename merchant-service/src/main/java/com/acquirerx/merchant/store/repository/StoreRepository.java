package com.acquirerx.merchant.store.repository;

import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.merchant.entity.Merchant;
import com.acquirerx.merchant.store.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

	Page<Store> findAll(Pageable pageable);

	List<Store> findByMerchant(Merchant merchant);

	Page<Store> findByMerchant(Merchant merchant, Pageable pageable);

	List<Store> findByStatus(Status status);

	Page<Store> findByStatus(Status status, Pageable pageable);

	List<Store> findByMerchantAndStatus(Merchant merchant, Status status);

	@Query("SELECT s FROM Store s WHERE " +
			"(:storeName IS NULL OR LOWER(s.storeName) LIKE LOWER(CONCAT('%', :storeName, '%'))) AND " +
			"(:region IS NULL OR LOWER(s.region) = LOWER(:region)) AND " +
			"(:address IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :address, '%'))) AND " +
			"(:status IS NULL OR s.status = :status) AND " +
			"(:merchantId IS NULL OR s.merchant.merchantId = :merchantId)")
	Page<Store> findByFiltersPaged(
			@Param("storeName") String storeName,
			@Param("region") String region,
			@Param("address") String address,
			@Param("status") Status status,
			@Param("merchantId") Long merchantId,
			Pageable pageable);

	Long countByStatus(Status status);

	@Query("SELECT COUNT(DISTINCT s.region) FROM Store s WHERE s.region IS NOT NULL")
	Long countDistinctRegions();
}
