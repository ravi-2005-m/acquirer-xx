package com.acquirerx.transaction.health;

import com.acquirerx.transaction.fee.repository.TxnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class BusinessHealthIndicator implements HealthIndicator {

    private final TxnRepository txnRepository;

    @Override
    public Health health() {
        try {
            long recentTxns = txnRepository.countByTxnDateAfter(LocalDateTime.now().minusHours(1));
            return Health.up()
                .withDetail("recentTxns1h", recentTxns)
                .build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
