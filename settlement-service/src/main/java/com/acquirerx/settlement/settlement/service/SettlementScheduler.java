package com.acquirerx.settlement.settlement.service;

import com.acquirerx.settlement.client.MerchantServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class SettlementScheduler {

    private final SettlementService settlementService;
    private final MerchantServiceClient merchantClient;

    @Scheduled(cron = "0 0 1 * * *")
    public void runEodSettlement() {
        log.info("=== EOD Settlement Job Started ===");

        List<Map<String, Object>> merchants;
        try {
            Map<String, Object> resp = merchantClient.getActiveMerchants(0, 1000);
            Object dataObj = resp.get("data");

            if (dataObj instanceof Map) {
                Map<String, Object> pagedData = (Map<String, Object>) dataObj;
                merchants = (List<Map<String, Object>>) pagedData.get("content");
            } else if (dataObj instanceof List) {
                merchants = (List<Map<String, Object>>) dataObj;
            } else {
                log.warn("Unexpected response format from merchant-service");
                return;
            }
        } catch (Exception e) {
            log.error("Failed to fetch active merchants: {}", e.getMessage());
            return;
        }

        if (merchants == null || merchants.isEmpty()) {
            log.info("No active merchants found");
            return;
        }

        int success = 0;
        int skip = 0;
        int fail = 0;

        for (Map<String, Object> merchant : merchants) {
            Long merchantId = Long.valueOf(merchant.get("merchantId").toString());
            try {
                settlementService.settle(merchantId, null);
                success++;
            } catch (IllegalStateException e) {
                skip++;
            } catch (Exception e) {
                log.error("Settlement failed for merchant {}: {}", merchantId, e.getMessage());
                fail++;
            }
        }

        log.info("=== EOD Settlement Completed === success={}, skipped={}, failed={}",
                success, skip, fail);
    }

    public void runManualSettlement() {
        log.info("Manual settlement triggered");
        runEodSettlement();
    }
}
