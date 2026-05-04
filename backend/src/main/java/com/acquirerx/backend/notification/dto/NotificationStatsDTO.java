package com.acquirerx.backend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NotificationStatsDTO {

    private Long totalNotifications;
    private Long unreadCount;
    private Long readCount;
    private Long dismissedCount;

    private Long batchNotifications;
    private Long settlementNotifications;
    private Long disputeNotifications;
    private Long riskNotifications;
    private Long reconNotifications;

    private Long sentToday;
    private Long unreadToday;
}
