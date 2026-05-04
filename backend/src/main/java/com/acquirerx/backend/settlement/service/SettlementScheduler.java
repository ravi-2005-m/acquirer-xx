package com.acquirerx.backend.settlement.service;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.acquirerx.backend.common.enums.NotificationCategory;
import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.repository.MerchantRepository;
import com.acquirerx.backend.notification.service.NotificationService;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SettlementScheduler {

    private final SettlementService settlementService;
    private final MerchantRepository merchantRepository;
    private final TxnRepository txnRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 1 * * *")
    public void runEodSettlement() {
        log.info("=== EOD Settlement Job Started ===");

        List<Merchant> merchants = merchantRepository.findByStatus(Status.ACTIVE);

        int successCount = 0;
        int skipCount = 0;
        int failCount = 0;

        for (Merchant merchant : merchants) {
            try {
                boolean hasUnsettled = txnRepository.findByMerchant(merchant).stream()
                        .anyMatch(txn -> !txn.isSettled() && txn.getStatus() == TxnStatus.APPROVED);

                if (!hasUnsettled) {
                    log.info("Skipping merchant {} — no unsettled transactions", merchant.getMerchantId());
                    skipCount++;
                    continue;
                }

                settlementService.settle(merchant.getMerchantId());
                notificationService.send(
                        merchant.getMerchantId(),
                        "Your daily settlement has been processed successfully.",
                        NotificationCategory.SETTLEMENT
                );
                successCount++;
            } catch (Exception ex) {
                log.error("Settlement failed for merchant {}: {}", merchant.getMerchantId(), ex.getMessage());
                notificationService.send(
                        merchant.getMerchantId(),
                        "Settlement processing failed. Please contact support.",
                        NotificationCategory.SETTLEMENT
                );
                failCount++;
            }
        }

        log.info("=== EOD Settlement Job Completed === success={}, skipped={}, failed={}",
                successCount, skipCount, failCount);
    }

    public void runManualSettlement() {
        log.info("Manual settlement triggered");
        runEodSettlement();
    }
}
