package com.acquirerx.transaction.switchmodule.repository;

import com.acquirerx.transaction.switchmodule.entity.AuthMessage;
import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AuthMessageRepository extends JpaRepository<AuthMessage, Long> {

    Page<AuthMessage> findByStatus(TxnStatus status, Pageable pageable);

    @Query("SELECT a FROM AuthMessage a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:txnType IS NULL OR a.txnType = :txnType) AND " +
           "(:minAmount IS NULL OR a.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR a.amount <= :maxAmount) AND " +
           "(:fromDate IS NULL OR a.txnTime >= :fromDate) AND " +
           "(:toDate IS NULL OR a.txnTime <= :toDate) AND " +
           "(:merchantId IS NULL OR a.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR a.terminalId = :terminalId) AND " +
           "(:network IS NULL OR a.network = :network)")
    Page<AuthMessage> findByFiltersPaged(
            @Param("status") TxnStatus status,
            @Param("txnType") String txnType,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("merchantId") Long merchantId,
            @Param("terminalId") Long terminalId,
            @Param("network") String network,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM AuthMessage a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:txnType IS NULL OR a.txnType = :txnType) AND " +
           "(:merchantId IS NULL OR a.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR a.terminalId = :terminalId) AND " +
           "(:fromDate IS NULL OR a.txnTime >= :fromDate) AND " +
           "(:toDate IS NULL OR a.txnTime <= :toDate)")
    BigDecimal sumAmountByFilters(
            @Param("status") TxnStatus status,
            @Param("txnType") String txnType,
            @Param("merchantId") Long merchantId,
            @Param("terminalId") Long terminalId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("SELECT a.txnType, COUNT(a) FROM AuthMessage a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:merchantId IS NULL OR a.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR a.terminalId = :terminalId) AND " +
           "(:fromDate IS NULL OR a.txnTime >= :fromDate) AND " +
           "(:toDate IS NULL OR a.txnTime <= :toDate) " +
           "GROUP BY a.txnType")
    List<Object[]> countByType(
            @Param("status") TxnStatus status,
            @Param("merchantId") Long merchantId,
            @Param("terminalId") Long terminalId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);
}
