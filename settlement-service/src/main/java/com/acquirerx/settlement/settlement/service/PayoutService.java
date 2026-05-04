package com.acquirerx.settlement.settlement.service;

import com.acquirerx.settlement.common.exception.ResourceNotFoundException;
import com.acquirerx.settlement.settlement.entity.Payout;
import com.acquirerx.settlement.settlement.entity.SettlementBatch;
import com.acquirerx.settlement.settlement.repository.PayoutRepository;
import com.acquirerx.settlement.settlement.repository.SettlementBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayoutService {

    private final SettlementBatchRepository settlementRepo;
    private final PayoutRepository payoutRepo;

    public Payout processPayout(Long settlementId) {
        SettlementBatch batch = settlementRepo.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        Payout payout = new Payout();
        payout.setSettlementBatch(batch);
        payout.setAmount(batch.getNetAmount());
        payout.setStatus("PAID");

        batch.setStatus("PAID");
        settlementRepo.save(batch);

        log.info("Payout processed for settlement {}", settlementId);

        return payoutRepo.save(payout);
    }

    @Async
    public void processPayoutAsync(Long settlementId) {
        processPayout(settlementId);
    }
}
