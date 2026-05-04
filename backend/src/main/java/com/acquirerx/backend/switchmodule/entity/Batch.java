package com.acquirerx.backend.switchmodule.entity;

import com.acquirerx.backend.switchmodule.enums.BatchStatus;
import com.acquirerx.backend.terminal.entity.Terminal;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "batch", indexes = {
    @Index(name = "idx_batch_terminal", columnList = "terminal_id"),
    @Index(name = "idx_batch_status", columnList = "status")
})
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long batchId;

    @ManyToOne
    @JoinColumn(name = "terminal_id", nullable = false)
    private Terminal terminal;

    @Enumerated(EnumType.STRING)
    private BatchStatus status;

    private LocalDateTime openTime;
    private LocalDateTime closeTime;
}
