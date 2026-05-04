package com.acquirerx.backend.reporting.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.dispute.repository.DisputeCaseRepository;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.service.MerchantService;
import com.acquirerx.backend.reconciliation.repository.ReconItemRepository;
import com.acquirerx.backend.reporting.dto.ReportFilterDTO;
import com.acquirerx.backend.reporting.dto.ReportResponseDTO;
import com.acquirerx.backend.reporting.dto.ReportStatsDTO;
import com.acquirerx.backend.reporting.entity.AcquirerReport;
import com.acquirerx.backend.reporting.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final ReportRepository reportRepository;
    private final TxnRepository txnRepository;
    private final DisputeCaseRepository disputeCaseRepository;
    private final ReconItemRepository reconItemRepository;
    private final MerchantService merchantService;

    public ReportResponseDTO generateMerchantReport(Long merchantId) {
        Merchant merchant = merchantService.getEntityById(merchantId);

        List<Txn> txns = txnRepository.findByMerchant(merchant);

        int txnCount = txns.size();
        double totalVolume = txns.stream().mapToDouble(t -> t.getAmount() == null ? 0.0 : t.getAmount()).sum();
        double totalFees = txns.stream().mapToDouble(t -> t.getTotalFee() == null ? 0.0 : t.getTotalFee()).sum();
        double totalNet = totalVolume - totalFees;

        int disputeCount = (int) disputeCaseRepository.findAll().stream()
                .filter(d -> d.getTxn() != null && d.getTxn().getMerchant() != null)
                .filter(d -> merchantId.equals(d.getTxn().getMerchant().getMerchantId()))
                .count();

        double chargebackRate = txnCount > 0
                ? Math.round((disputeCount * 100.0 / txnCount) * 100.0) / 100.0
                : 0.0;

        int reconMismatches = reconItemRepository.findByMatchStatus("MISMATCHED").size();

        AcquirerReport report = new AcquirerReport();
        report.setScope("MERCHANT");
        report.setScopeRefId(merchantId);
        report.setTotalTxnCount(txnCount);
        report.setTotalVolume(round(totalVolume));
        report.setTotalFees(round(totalFees));
        report.setTotalNet(round(totalNet));
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
        List<Txn> allTxns = txnRepository.findAll();

        int txnCount = allTxns.size();
        double totalVolume = allTxns.stream().mapToDouble(t -> t.getAmount() == null ? 0.0 : t.getAmount()).sum();
        double totalFees = allTxns.stream().mapToDouble(t -> t.getTotalFee() == null ? 0.0 : t.getTotalFee()).sum();
        double totalNet = totalVolume - totalFees;

        int disputeCount = disputeCaseRepository.findAll().size();

        double chargebackRate = txnCount > 0
                ? Math.round((disputeCount * 100.0 / txnCount) * 100.0) / 100.0
                : 0.0;

        int reconMismatches = reconItemRepository.findByMatchStatus("MISMATCHED").size();

        AcquirerReport report = new AcquirerReport();
        report.setScope("NETWORK");
        report.setScopeRefId(null);
        report.setTotalTxnCount(txnCount);
        report.setTotalVolume(round(totalVolume));
        report.setTotalFees(round(totalFees));
        report.setTotalNet(round(totalNet));
        report.setChargebackRate(chargebackRate);
        report.setDisputeCount(disputeCount);
        report.setReconMismatchCount(reconMismatches);
        report.setPeriodFrom(LocalDateTime.now().minusDays(30));
        report.setPeriodTo(LocalDateTime.now());

        AcquirerReport saved = reportRepository.save(report);
        log.info("Network report generated: txns={}, volume={}", txnCount, totalVolume);

        return toResponse(saved);
    }

        public PagedResponseDTO<ReportResponseDTO> getAll(int page, int size) {
        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "generatedAt")
        );

        Page<AcquirerReport> reportPage = reportRepository.findAll(pageRequest);
        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

        public PagedResponseDTO<ReportResponseDTO> getByScope(
            String scope, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "generatedAt")
        );

        Page<AcquirerReport> reportPage = reportRepository.findByScope(scope, pageRequest);
        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

        public PagedResponseDTO<ReportResponseDTO> getByMerchant(
            Long merchantId, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "generatedAt")
        );

        Page<AcquirerReport> reportPage = reportRepository.findByFiltersPaged(
            "MERCHANT",
            merchantId,
            null,
            null,
            null,
            null,
            pageRequest
        );

        Page<ReportResponseDTO> dtoPage = reportPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public PagedResponseDTO<ReportResponseDTO> searchReports(
            ReportFilterDTO filter, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
            page, size,
            Sort.by(Sort.Direction.DESC, "generatedAt")
        );

        Page<AcquirerReport> reportPage = reportRepository.findByFiltersPaged(
            filter.getScope(),
            filter.getScopeRefId(),
            filter.getFromDate(),
            filter.getToDate(),
            filter.getMinChargebackRate(),
            filter.getMaxChargebackRate(),
            pageRequest
        );

        log.info("Report search: filters={}, total={}",
            filter, reportPage.getTotalElements());

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
            log.warn("Report stats: {} reports exceed 1% chargeback rate threshold!",
                aboveThreshold);
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

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private long value(Long value) {
        return value == null ? 0L : value;
    }
}
