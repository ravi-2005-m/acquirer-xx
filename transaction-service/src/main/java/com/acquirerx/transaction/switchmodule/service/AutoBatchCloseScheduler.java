package com.acquirerx.transaction.switchmodule.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.acquirerx.transaction.client.TerminalServiceClient;
import com.acquirerx.transaction.switchmodule.entity.Batch;
import com.acquirerx.transaction.switchmodule.enums.BatchStatus;
import com.acquirerx.transaction.switchmodule.repository.BatchRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoBatchCloseScheduler {

    private final BatchRepository batchRepo;
    private final TerminalServiceClient terminalClient;

    // Runs at the top of every hour
    @Scheduled(cron = "0 0 * * * *")
    public void autoCloseBatches() {
        int currentHour = LocalDateTime.now().getHour();
        List<Batch> openBatches = batchRepo.findAllByStatus(BatchStatus.OPEN);
        if (openBatches.isEmpty()) return;

        log.info("AutoBatchClose: checking {} open batches at hour {}", openBatches.size(), currentHour);

        for (Batch batch : openBatches) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> resp = terminalClient.getTerminalById(batch.getTerminalId());
                @SuppressWarnings("unchecked")
                Map<String, Object> data = resp.get("data") instanceof Map
                        ? (Map<String, Object>) resp.get("data") : resp;

                String paramsJsonStr = data.get("paramsJson") != null ? data.get("paramsJson").toString() : null;
                if (paramsJsonStr == null || paramsJsonStr.isBlank()) continue;

                @SuppressWarnings("unchecked")
                Map<String, Object> params = new com.fasterxml.jackson.databind.ObjectMapper()
                        .readValue(paramsJsonStr, Map.class);

                Object autoCloseHourObj = params.get("autoBatchCloseHour");
                if (autoCloseHourObj == null) continue;

                int autoCloseHour = Integer.parseInt(autoCloseHourObj.toString());
                if (currentHour == autoCloseHour) {
                    batch.setStatus(BatchStatus.CLOSED);
                    batch.setCloseTime(LocalDateTime.now());
                    batchRepo.save(batch);
                    log.info("AutoBatchClose: closed batch {} for terminal {} (autoBatchCloseHour={})",
                            batch.getBatchId(), batch.getTerminalId(), autoCloseHour);
                }
            } catch (Exception e) {
                log.error("AutoBatchClose: failed to process batch {}: {}", batch.getBatchId(), e.getMessage());
            }
        }
    }
}