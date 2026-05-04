package com.acquirerx.backend.fee.repository;

import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TxnRepository extends JpaRepository<Txn, Long> {

    // Used by SettlementService
    List<Txn> findByMerchant(Merchant merchant);

    Page<Txn> findByMerchant(Merchant merchant, Pageable pageable);

    // Used by SettlementService — only unsettled txns
    List<Txn> findByMerchantAndSettledFalse(Merchant merchant);

    // Used by ReportingService
    List<Txn> findByStatus(TxnStatus status);

    @Query("SELECT t FROM Txn t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:settled IS NULL OR t.settled = :settled) AND " +
           "(:minAmount IS NULL OR t.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR t.amount <= :maxAmount) AND " +
           "(:fromDate IS NULL OR t.txnDate >= :fromDate) AND " +
           "(:toDate IS NULL OR t.txnDate <= :toDate) AND " +
           "(:merchantId IS NULL OR t.merchant.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR t.terminal.terminalId = :terminalId) AND " +
           "(:currency IS NULL OR t.currency = :currency)")
    Page<Txn> findByFiltersPaged(
            @Param("status") TxnStatus status,
            @Param("settled") Boolean settled,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("merchantId") Long merchantId,
            @Param("terminalId") Long terminalId,
            @Param("currency") String currency,
            Pageable pageable);

    @Query("SELECT SUM(t.totalFee) FROM Txn t WHERE t.merchant.merchantId = :merchantId")
    Double sumTotalFeeByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.amount) FROM Txn t WHERE t.merchant.merchantId = :merchantId")
    Double sumAmountByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.schemeFee) FROM Txn t WHERE t.merchant.merchantId = :merchantId")
    Double sumSchemeFeeByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.interchangeFee) FROM Txn t WHERE t.merchant.merchantId = :merchantId")
    Double sumInterchangeFeeByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.acquirerMarkup) FROM Txn t WHERE t.merchant.merchantId = :merchantId")
    Double sumAcquirerMarkupByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT COUNT(t) FROM Txn t WHERE t.merchant.merchantId = :merchantId AND t.settled = true")
    Long countSettledByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT COUNT(t) FROM Txn t WHERE t.merchant.merchantId = :merchantId AND t.settled = false")
    Long countUnsettledByMerchant(@Param("merchantId") Long merchantId);
}
