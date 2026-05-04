package com.acquirerx.backend.settlement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payout")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payoutId;

    @ManyToOne
    @JoinColumn(name = "settle_batch_id", nullable = false)
    private SettlementBatch settlementBatch;

    private String bankAccountRef;

    private Double amount;

    private LocalDateTime payoutDate;

    private String status;

    @PrePersist
    public void prePersist() {
        this.payoutDate = LocalDateTime.now();
    }
}
