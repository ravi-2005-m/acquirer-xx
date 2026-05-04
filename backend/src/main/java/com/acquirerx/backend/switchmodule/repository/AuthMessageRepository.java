package com.acquirerx.backend.switchmodule.repository;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.switchmodule.entity.AuthMessage;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import com.acquirerx.backend.terminal.entity.Terminal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuthMessageRepository extends JpaRepository<AuthMessage, Long> {

    List<AuthMessage> findByMerchant(Merchant merchant);

    List<AuthMessage> findByTerminal(Terminal terminal);

    List<AuthMessage> findByStatus(TxnStatus status);

        @Query("SELECT a FROM AuthMessage a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:txnType IS NULL OR a.txnType = :txnType) AND " +
           "(:minAmount IS NULL OR a.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR a.amount <= :maxAmount) AND " +
           "(:fromDate IS NULL OR a.txnTime >= :fromDate) AND " +
           "(:toDate IS NULL OR a.txnTime <= :toDate) AND " +
           "(:merchantId IS NULL OR a.merchant.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR a.terminal.terminalId = :terminalId) AND " +
           "(:network IS NULL OR a.network = :network)")
        List<AuthMessage> findByFilters(
            @Param("status") TxnStatus status,
            @Param("txnType") String txnType,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("merchantId") Long merchantId,
            @Param("terminalId") Long terminalId,
            @Param("network") String network);

        @Query("SELECT a FROM AuthMessage a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:txnType IS NULL OR a.txnType = :txnType) AND " +
           "(:minAmount IS NULL OR a.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR a.amount <= :maxAmount) AND " +
           "(:fromDate IS NULL OR a.txnTime >= :fromDate) AND " +
           "(:toDate IS NULL OR a.txnTime <= :toDate) AND " +
           "(:merchantId IS NULL OR a.merchant.merchantId = :merchantId) AND " +
           "(:terminalId IS NULL OR a.terminal.terminalId = :terminalId) AND " +
           "(:network IS NULL OR a.network = :network)")
        Page<AuthMessage> findByFiltersPaged(
            @Param("status") TxnStatus status,
            @Param("txnType") String txnType,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("merchantId") Long merchantId,
            @Param("terminalId") Long terminalId,
            @Param("network") String network,
            Pageable pageable);

        Page<AuthMessage> findByMerchant_MerchantId(Long merchantId, Pageable pageable);
}
