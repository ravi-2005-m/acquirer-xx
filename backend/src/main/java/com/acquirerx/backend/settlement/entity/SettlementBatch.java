package com.acquirerx.backend.settlement.entity;

import com.acquirerx.backend.merchant.entity.Merchant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "settlement_batch", indexes = {
        @Index(name = "idx_settle_merchant", columnList = "merchant_id"),
        @Index(name = "idx_settle_status", columnList = "status")
})
public class SettlementBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settleBatchId;

    @ManyToOne
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    private Double grossAmount;
    private Double totalFees;
    private Double netAmount;

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    @Column(length = 30)
    private String status;

    private LocalDateTime postedDate;

    private Integer txnCount;

    @PrePersist
    public void prePersist() {
        this.postedDate = LocalDateTime.now();
    }
}
