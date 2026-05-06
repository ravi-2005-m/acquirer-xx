package com.acquirerx.transaction.fee.repository;

import com.acquirerx.transaction.fee.entity.Txn;
import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TxnRepository extends JpaRepository<Txn, Long> {

    Optional<Txn> findByAuthId(Long authId);

    List<Txn> findByMerchantId(Long merchantId);

    List<Txn> findByMerchantIdAndSettledFalse(Long merchantId);

    List<Txn> findByStatus(TxnStatus status);

    long countByTxnDateAfter(LocalDateTime date);

    Page<Txn> findByMerchantId(Long merchantId, Pageable pageable);

    @Query("SELECT t FROM Txn t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:settled IS NULL OR t.settled = :settled) AND " +
           "(:minAmount IS NULL OR t.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR t.amount <= :maxAmount) AND " +
           "(:fromDate IS NULL OR t.txnDate >= :fromDate) AND " +
           "(:toDate IS NULL OR t.txnDate <= :toDate) AND " +
           "(:merchantId IS NULL OR t.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR t.terminalId = :terminalId) AND " +
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

    @Query("SELECT SUM(t.totalFee) FROM Txn t WHERE t.merchantId = :merchantId")
    BigDecimal sumTotalFeeByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.amount) FROM Txn t WHERE t.merchantId = :merchantId")
    BigDecimal sumAmountByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.schemeFee) FROM Txn t WHERE t.merchantId = :merchantId")
    BigDecimal sumSchemeFeeByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.interchangeFee) FROM Txn t WHERE t.merchantId = :merchantId")
    BigDecimal sumInterchangeFeeByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT SUM(t.acquirerMarkup) FROM Txn t WHERE t.merchantId = :merchantId")
    BigDecimal sumAcquirerMarkupByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT COUNT(t) FROM Txn t WHERE t.merchantId = :merchantId AND t.settled = true")
    Long countSettledByMerchant(@Param("merchantId") Long merchantId);

    @Query("SELECT COUNT(t) FROM Txn t WHERE t.merchantId = :merchantId AND t.settled = false")
    Long countUnsettledByMerchant(@Param("merchantId") Long merchantId);

    Long countBySettled(boolean settled);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Txn t WHERE t.settled = true")
    Double sumSettledAmount();

    @Query("SELECT COALESCE(SUM(t.totalFee), 0) FROM Txn t")
    Double sumTotalFee();
}
