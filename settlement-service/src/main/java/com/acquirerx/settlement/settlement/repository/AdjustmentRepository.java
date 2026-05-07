package com.acquirerx.settlement.settlement.repository;

import com.acquirerx.settlement.settlement.entity.Adjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface AdjustmentRepository extends JpaRepository<Adjustment, Long> {

    Page<Adjustment> findByMerchantId(Long merchantId, Pageable pageable);

    @Query("SELECT SUM(a.amount) FROM Adjustment a WHERE a.merchantId = :merchantId AND a.status = 'APPLIED'")
    BigDecimal sumAdjustmentsByMerchant(@Param("merchantId") Long merchantId);
}
