package com.acquirerx.backend.terminal.repository;

import com.acquirerx.backend.terminal.entity.Terminal;
import com.acquirerx.backend.terminal.entity.TerminalHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TerminalHealthRepository extends JpaRepository<TerminalHealth, Long> {

    Optional<TerminalHealth> findByTerminal(Terminal terminal);

    List<TerminalHealth> findByStatus(String status);

    Long countByStatus(String status);

    @Query("SELECT h FROM TerminalHealth h WHERE h.lastSeen < :threshold")
    List<TerminalHealth> findStaleTerminals(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT h FROM TerminalHealth h WHERE h.batteryPct IS NOT NULL AND h.batteryPct < :threshold")
    List<TerminalHealth> findLowBattery(@Param("threshold") Integer threshold);

    @Query("SELECT h FROM TerminalHealth h WHERE h.signalStrength IS NOT NULL AND h.signalStrength < :threshold")
    List<TerminalHealth> findWeakSignal(@Param("threshold") Integer threshold);
}