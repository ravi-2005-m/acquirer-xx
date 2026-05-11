package com.acquirerx.settlement.settlement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "settlement_batch", indexes = {
        @Index(name = "idx_settle_merchant", columnList = "merchant_id"),
        @Index(name = "idx_settle_status", columnList = "status")
})
public class SettlementBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settleBatchId;

    @Column(name = "merchant_id")
    private Long merchantId;

    private String merchantName;

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    @Column(precision = 15, scale = 4)
    private BigDecimal grossAmount;
    @Column(precision = 15, scale = 4)
    private BigDecimal totalFees;
    @Column(precision = 15, scale = 4)
    private BigDecimal schemeFees;
    @Column(precision = 15, scale = 4)
    private BigDecimal interchangeFees;
    @Column(precision = 15, scale = 4)
    private BigDecimal acquirerMarkups;
    @Column(precision = 15, scale = 4)
    private BigDecimal adjustmentTotal;
    @Column(precision = 15, scale = 4)
    private BigDecimal netAmount;
    private Integer txnCount;
    @Column(columnDefinition = "TEXT")
    private String txnSummary;
    private LocalDateTime postedDate;
    private String status;

    @PrePersist
    public void prePersist() {
        this.postedDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = "READY";
        }
    }
}
