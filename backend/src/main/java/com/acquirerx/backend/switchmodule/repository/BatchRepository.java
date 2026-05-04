package com.acquirerx.backend.switchmodule.repository;

import com.acquirerx.backend.switchmodule.entity.Batch;
import com.acquirerx.backend.switchmodule.enums.BatchStatus;
import com.acquirerx.backend.terminal.entity.Terminal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByTerminalAndStatus(Terminal terminal, BatchStatus status);

    List<Batch> findByTerminal(Terminal terminal);
}
