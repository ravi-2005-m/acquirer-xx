package com.acquirerx.ops.reporting.service;

import com.acquirerx.ops.client.MerchantServiceClient;
import com.acquirerx.ops.client.TransactionServiceClient;
import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.dispute.repository.DisputeCaseRepository;
import com.acquirerx.ops.reconciliation.repository.ReconItemRepository;
import com.acquirerx.ops.reporting.dto.ReportFilterDTO;
import com.acquirerx.ops.reporting.dto.ReportResponseDTO;
import com.acquirerx.ops.reporting.dto.ReportStatsDTO;
import com.acquirerx.ops.reporting.entity.AcquirerReport;
import com.acquirerx.ops.reporting.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportingService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "reportId", "scope", "chargebackRate", "generatedAt"
    );

    private final ReportRepository reportRepository;
    private final DisputeCaseRepository disputeCaseRepository;
    private final ReconItemRepository reconItemRepository;
    private final TransactionServiceClient transactionClient;
    private final MerchantServiceClient merchantClient;

    public ReportResponseDTO generateMerchantReport(Long merchantId) {
        String merchantName = "Unknown";
        try {
            Map<String, Object> merchantResp = merchantClient.getMerchantById(merchantId);
            Map<String, Object> merchantData = (Map<String, Object>) merchantResp.get("data");
            if (merchantData != null && merchantData.get("legalName") != null) {
                merchantName = merchantData.get("legalName").toString();
            }
        } catch (Exception e) {
            log.warn("Could not fetch merchant {} details: {}", merchantId, e.getMessage());
        }

        List<Map<String, Object>> txns;
        try {
            Map<String, Object> resp = transactionClient.getTxnsByMerchant(merchantId, 0, 10000);
            Map<String, Object> pagedData = (Map<String, Object>) resp.get("data");
            txns = pagedData != null && pagedData.get("content") instanceof List
                    ? (List<Map<String, Object>>) pagedData.get("content")
                    : List.of();
        } catch (Exception e) {
            log.warn("Cannot fetch txns for merchant {}: {}", merchantId, e.getMessage());
            txns = List.of();
        }

        int txnCount = txns.size();
        BigDecimal totalVolume = txns.stream()
                .map(t -> t.get("amount") == null ? BigDecimal.ZERO : new BigDecimal(t.get("amount").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFees = txns.stream()
                .map(t -> t.get("totalFee") == null ? BigDecimal.ZERO : new BigDecimal(t.get("totalFee").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = totalVolume.subtract(totalFees);

        int disputeCount = (int) disputeCaseRepository.findAll().stream()
                .filter(d -> merchantId.equals(d.getMerchantId()))
                .count();

        double chargebackRate = txnCount > 0
                ? Math.round((disputeCount * 100.0 / txnCount) * 100.0) / 100.0
                : 0.0;

        int reconMismatches = reconItemRepository.findByMatchStatus("MISMATCHED").size();

        AcquirerReport report = new AcquirerReport();
        report.setScope("MERCHANT");
        report.setScopeRefId(merchantId);
        report.setTotalTxnCount(txnCount);
        report.setTotalVolume(totalVolume.setScale(4, RoundingMode.HALF_UP));
        report.setTotalFees(totalFees.setScale(4, RoundingMode.HALF_UP));
        report.setTotalNet(totalNet.setScale(4, RoundingMode.HALF_UP));
        report.setChargebackRate(chargebackRate);
        report.setDisputeCount(disputeCount);
        report.setReconMismatchCount(reconMismatches);
        report.setPeriodFrom(LocalDateTime.now().minusDays(30));
        report.setPeriodTo(LocalDateTime.now());

        AcquirerReport saved = reportRepository.save(report);
        log.info("Merchant report generated: merchantId={}, txns={}, volume={}", merchantId, txnCount, totalVolume);

        return toResponse(saved);
    }

    public ReportResponseDTO generateNetworkReport() {
        List<Map<String, Object>> allTxns;
        try {
            Map<String, Object> resp = transactionClient.getAllTxns();
            Object dataObj = resp.get("data");
            allTxns = dataObj instanceof List ? (List<Map<String, Object>>) dataObj : List.of();
        } catch (Exception e) {
            log.warn("Cannot fetch network txns: {}", e.getMessage());
            allTxns = List.of();
        }

        int txnCount = allTxns.size();
        BigDecimal totalVolume = allTxns.stream()
                .map(t -> t.get("amount") == null ? BigDecimal.ZERO : new BigDecimal(t.get("amount").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalFees = allTxns.stream()
                .map(t -> t.get("totalFee") == null ? BigDecimal.ZERO : new BigDecimal(t.get("totalFee").toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = totalVolume.subtract(totalFees);

        int disputeCount = disputeCaseRepository.findAll().size();

        double chargebackRate = txnCount > 0
                ? Math.round((disputeCount * 100.0 / txnCount) * 100.0) / 100.0
                : 0.0;

        int reconMismatches = reconItemRepository.findByMatchStatus("MISMATCHED").size();

        AcquirerReport report = new AcquirerReport();
        report.setScope("NETWORK");
        report.setScopeRefId(null);
        report.setTotalTxnCount(txnCount);
        report.setTotalVolume(totalVolume.setScale(4, RoundingMode.HALF_UP));
        report.setTotalFees(totalFees.setScale(4, RoundingMode.HALF_UP));
        report.setTotalNet(totalNet.setScale(4, RoundingMode.HALF_UP));
        report.setChargebackRate(chargebackRate);
        report.setDisputeCount(disputeCount);
        report.setReconMismatchCount(reconMismatches);
        report.setPeriodFrom(LocalDateTime.now().minusDays(30));
        report.setPeriodTo(LocalDateTime.now());

        AcquirerReport saved = reportRepository.save(report);
        log.info("Network report generated: txns={}, volume={}", txnCount, totalVolume);

        return toResponse(saved);
    }

    public PagedResponseDTO<ReportResponseDTO> getAll(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AcquirerReport> reportPage = reportRepository.findAll(pageable);
        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<ReportResponseDTO> getByScope(String scope, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AcquirerReport> reportPage = reportRepository.findByScope(scope, pageable);
        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<ReportResponseDTO> getByMerchant(Long merchantId, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AcquirerReport> reportPage = reportRepository.findByFiltersPaged(
            "MERCHANT",
            merchantId,
            null,
            null,
            null,
            null,
            pageable
        );

        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<ReportResponseDTO> searchReports(ReportFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AcquirerReport> reportPage = reportRepository.findByFiltersPaged(
            filter.getScope(),
            filter.getScopeRefId(),
            filter.getFromDate(),
            filter.getToDate(),
            filter.getMinChargebackRate(),
            filter.getMaxChargebackRate(),
            pageable
        );

        log.info("Report search: filters={}, total={}", filter, reportPage.getTotalElements());

        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public ReportStatsDTO getReportStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();

        long totalReports = reportRepository.count();
        long merchantScope = value(reportRepository.countByScope("MERCHANT"));
        long networkScope = value(reportRepository.countByScope("NETWORK"));

        long reportsToday = value(reportRepository.countGeneratedAfter(todayStart));
        long reportsThisWeek = value(reportRepository.countGeneratedAfter(weekStart));

        Double maxChargebackRate = reportRepository.findMaxChargebackRate();
        double highestCbRate = maxChargebackRate != null ? maxChargebackRate : 0.0;

        long aboveThreshold = value(reportRepository.countAboveChargebackThreshold());

        if (aboveThreshold > 0) {
            log.warn("Report stats: {} reports exceed 1% chargeback rate threshold!", aboveThreshold);
        }

        log.info("Report stats: total={}, today={}, thisWeek={}, highestCbRate={}%",
            totalReports, reportsToday, reportsThisWeek, highestCbRate);

        return new ReportStatsDTO(
            totalReports,
            merchantScope,
            networkScope,
            reportsToday,
            reportsThisWeek,
            Math.round(highestCbRate * 100.0) / 100.0,
            aboveThreshold
        );
    }

    private ReportResponseDTO toResponse(AcquirerReport report) {
        ReportResponseDTO dto = new ReportResponseDTO();
        dto.setReportId(report.getReportId());
        dto.setScope(report.getScope());
        dto.setScopeRefId(report.getScopeRefId());
        dto.setTotalTxnCount(report.getTotalTxnCount());
        dto.setTotalVolume(report.getTotalVolume());
        dto.setTotalFees(report.getTotalFees());
        dto.setTotalNet(report.getTotalNet());
        dto.setChargebackRate(report.getChargebackRate());
        dto.setDisputeCount(report.getDisputeCount());
        dto.setReconMismatchCount(report.getReconMismatchCount());
        dto.setGeneratedAt(report.getGeneratedAt());
        dto.setPeriodFrom(report.getPeriodFrom());
        dto.setPeriodTo(report.getPeriodTo());
        return dto;
    }

    private long value(Long value) {
        return value == null ? 0L : value;
    }
}
