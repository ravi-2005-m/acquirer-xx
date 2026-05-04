package com.acquirerx.backend.settlement.service;

import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.settlement.entity.Payout;
import com.acquirerx.backend.settlement.entity.SettlementBatch;
import com.acquirerx.backend.settlement.repository.PayoutRepository;
import com.acquirerx.backend.settlement.repository.SettlementBatchRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PayoutService {

    private static final Logger log = LoggerFactory.getLogger(PayoutService.class);

    private final SettlementBatchRepository settlementRepo;
    private final PayoutRepository payoutRepo;

    public Payout processPayout(Long settlementId) {
        SettlementBatch batch = settlementRepo.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        Payout payout = new Payout();
        payout.setSettlementBatch(batch);
        payout.setAmount(batch.getNetAmount());
        payout.setPayoutDate(LocalDateTime.now());
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
