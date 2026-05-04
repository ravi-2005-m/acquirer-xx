package com.acquirerx.ops.reporting.service;

import com.acquirerx.ops.client.MerchantServiceClient;
import com.acquirerx.ops.client.RiskServiceClient;
import com.acquirerx.ops.client.SettlementStatsClient;
import com.acquirerx.ops.client.TxnStatsClient;
import com.acquirerx.ops.dispute.service.DisputeService;
import com.acquirerx.ops.reporting.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final MerchantServiceClient merchantClient;
    private final TxnStatsClient txnStatsClient;
    private final SettlementStatsClient settlementStatsClient;
    private final RiskServiceClient riskServiceClient;
    private final DisputeService disputeService;

    public AnalyticsDashboardDTO getDashboardSummary() {
        Map<String, Object> merchantData = safeData(merchantClient.getMerchantStats());
        Map<String, Object> settleData   = safeData(settlementStatsClient.getSettlementStats());
        var disputeStats = disputeService.getDisputeStats();
        Map<String, Object> riskData     = safeData(riskServiceClient.getRiskSummary());

        return AnalyticsDashboardDTO.builder()
                .totalMerchants(longVal(merchantData, "totalMerchants"))
                .activeMerchants(longVal(merchantData, "activeMerchants"))
                .totalStores(longVal(merchantData, "totalStores"))
                .totalTerminals(longVal(merchantData, "totalTerminals"))
                .openDisputes(disputeStats != null ? disputeStats.getOpenDisputes() : 0L)
                .totalRiskEvents(longVal(riskData, "totalRiskEvents"))
                .riskEventsToday(longVal(riskData, "todayRiskEvents"))
                .totalSettlementBatches(longVal(settleData, "totalBatches"))
                .pendingSettlements(longVal(settleData, "readyBatches"))
                .build();
    }

    public TxnVolumeDTO getTransactionVolume() {
        Map<String, Object> d = safeData(txnStatsClient.getTxnStats());
        return TxnVolumeDTO.builder()
                .totalTxns(longVal(d, "totalTxns"))
                .settledTxns(longVal(d, "settledTxns"))
                .unsettledTxns(longVal(d, "unsettledTxns"))
                .settledAmount(doubleVal(d, "settledAmount"))
                .totalFees(doubleVal(d, "totalFees"))
                .build();
    }

    public SettleAnalyticsDTO getSettlementSummary() {
        Map<String, Object> d = safeData(settlementStatsClient.getSettlementStats());
        return SettleAnalyticsDTO.builder()
                .totalBatches(longVal(d, "totalBatches"))
                .readyBatches(longVal(d, "readyBatches"))
                .paidBatches(longVal(d, "paidBatches"))
                .onHoldBatches(longVal(d, "onHoldBatches"))
                .totalGrossAmount(doubleVal(d, "totalGrossAmount"))
                .totalNetAmount(doubleVal(d, "totalNetAmount"))
                .totalFees(doubleVal(d, "totalFees"))
                .build();
    }

    public Object getDisputeSummary() {
        return disputeService.getDisputeStats();
    }

    public RiskAnalyticsDTO getRiskSummary() {
        Map<String, Object> d = safeData(riskServiceClient.getRiskSummary());
        return RiskAnalyticsDTO.builder()
                .totalRiskEvents(longVal(d, "totalRiskEvents"))
                .totalBlocked(longVal(d, "totalBlocked"))
                .totalReviewed(longVal(d, "totalReviewed"))
                .totalAllowed(longVal(d, "totalAllowed"))
                .todayRiskEvents(longVal(d, "todayRiskEvents"))
                .todayBlocked(longVal(d, "todayBlocked"))
                .activePanBlacklist(longVal(d, "activePanBlacklist"))
                .activeTerminalBlacklist(longVal(d, "activeTerminalBlacklist"))
                .activeMerchantBlacklist(longVal(d, "activeMerchantBlacklist"))
                .activeRules(longVal(d, "activeRules"))
                .blockRate(doubleVal(d, "blockRate"))
                .build();
    }

    public MerchantAnalyticsDTO getMerchantAnalytics() {
        Map<String, Object> d = safeData(merchantClient.getMerchantStats());
        return MerchantAnalyticsDTO.builder()
                .totalMerchants(longVal(d, "totalMerchants"))
                .activeMerchants(longVal(d, "activeMerchants"))
                .inactiveMerchants(longVal(d, "inactiveMerchants"))
                .pendingMerchants(longVal(d, "pendingMerchants"))
                .lowRiskCount(longVal(d, "lowRiskCount"))
                .mediumRiskCount(longVal(d, "mediumRiskCount"))
                .highRiskCount(longVal(d, "highRiskCount"))
                .criticalRiskCount(longVal(d, "criticalRiskCount"))
                .totalStores(longVal(d, "totalStores"))
                .totalTerminals(longVal(d, "totalTerminals"))
                .build();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> safeData(Map<String, Object> response) {
        try {
            Object data = response.get("data");
            if (data instanceof Map) {
                return (Map<String, Object>) data;
            }
        } catch (Exception e) {
            log.warn("Failed to extract data from response: {}", e.getMessage());
        }
        return Map.of();
    }

    private long longVal(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v instanceof Number n) return n.longValue();
        return 0L;
    }

    private double doubleVal(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v instanceof Number n) return n.doubleValue();
        return 0.0;
    }
}
