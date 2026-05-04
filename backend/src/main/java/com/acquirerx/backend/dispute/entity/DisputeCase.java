package com.acquirerx.backend.dispute.entity;

import com.acquirerx.backend.common.enums.DisputeStage;
import com.acquirerx.backend.common.enums.DisputeStatus;
import com.acquirerx.backend.fee.entity.Txn;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "dispute_case", indexes = {
        @Index(name = "idx_dispute_txn", columnList = "txn_id"),
        @Index(name = "idx_dispute_status", columnList = "status"),
        @Index(name = "idx_dispute_stage", columnList = "stage")
})
public class DisputeCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long caseId;

    @ManyToOne
    @JoinColumn(name = "txn_id", nullable = false)
    private Txn txn;

    @Enumerated(EnumType.STRING)
    private DisputeStage stage;

    @Enumerated(EnumType.STRING)
    private DisputeStatus status;

    private String reasonCode;

    private LocalDateTime openedDate;

    private LocalDateTime closedDate;

    private LocalDateTime deadline;

    @PrePersist
    public void prePersist() {
        this.openedDate = LocalDateTime.now();
        this.deadline = LocalDateTime.now().plusDays(30);
    }
}
