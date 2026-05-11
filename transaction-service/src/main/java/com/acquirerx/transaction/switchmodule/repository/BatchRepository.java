package com.acquirerx.transaction.switchmodule.repository;

import com.acquirerx.transaction.switchmodule.entity.Batch;
import com.acquirerx.transaction.switchmodule.enums.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByTerminalIdAndStatus(Long terminalId, BatchStatus status);

    List<Batch> findByTerminalId(Long terminalId);

    List<Batch> findAllByStatus(BatchStatus status);

    boolean existsByMerchantIdAndStatus(Long merchantId, BatchStatus status);
}
