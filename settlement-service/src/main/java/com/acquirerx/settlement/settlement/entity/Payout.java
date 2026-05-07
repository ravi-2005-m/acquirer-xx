package com.acquirerx.settlement.settlement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payout")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payoutId;

    @ManyToOne
    @JoinColumn(name = "settle_batch_id")
    private SettlementBatch settlementBatch;

    private String bankAccountRef;
    @Column(precision = 15, scale = 4)
    private BigDecimal amount;
    private String status;
    private LocalDateTime payoutDate;

    @PrePersist
    public void prePersist() {
        this.payoutDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = "INITIATED";
        }
    }
}
