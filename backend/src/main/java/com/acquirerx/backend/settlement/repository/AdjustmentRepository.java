package com.acquirerx.backend.settlement.repository;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.settlement.entity.Adjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdjustmentRepository extends JpaRepository<Adjustment, Long> {

    List<Adjustment> findByMerchant(Merchant merchant);

    Page<Adjustment> findByMerchant(Merchant merchant, Pageable pageable);

    List<Adjustment> findByMerchantAndStatus(Merchant merchant, String status);

    @Query("SELECT SUM(a.amount) FROM Adjustment a WHERE a.merchant.merchantId = :merchantId AND a.status = 'APPLIED'")
    Double sumAdjustmentsByMerchant(@Param("merchantId") Long merchantId);
}
