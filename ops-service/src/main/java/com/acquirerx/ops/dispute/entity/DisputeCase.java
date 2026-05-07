package com.acquirerx.ops.dispute.entity;

import com.acquirerx.ops.common.DisputeStage;
import com.acquirerx.ops.common.DisputeStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
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

    @Column(name = "txn_id", nullable = false)
    private Long txnId;

    private Long merchantId;
    @Column(precision = 15, scale = 4)
    private BigDecimal txnAmount;
    private String merchantName;

    @Column(name = "pan_masked")
    private String panMasked;

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


