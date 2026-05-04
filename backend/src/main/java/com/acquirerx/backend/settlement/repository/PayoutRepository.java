package com.acquirerx.backend.settlement.repository;

import com.acquirerx.backend.settlement.entity.Payout;
import com.acquirerx.backend.settlement.entity.SettlementBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayoutRepository extends JpaRepository<Payout, Long> {
	List<Payout> findBySettlementBatch(SettlementBatch batch);

	Optional<Payout> findBySettlementBatch_SettleBatchId(Long settleBatchId);
}
