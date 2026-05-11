package com.acquirerx.transaction.idempotency;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyCleanupScheduler {

    private final IdempotencyRecordRepository repo;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpired() {
        int deleted = repo.deleteExpired(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Deleted {} expired idempotency records", deleted);
        }
    }
}