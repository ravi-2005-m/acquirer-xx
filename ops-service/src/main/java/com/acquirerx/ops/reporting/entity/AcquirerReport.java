package com.acquirerx.ops.reporting.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "acquirer_report")
public class AcquirerReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    private String scope;

    private Long scopeRefId;

    private Integer totalTxnCount;
    @Column(precision = 15, scale = 4)
    private BigDecimal totalVolume;
    @Column(precision = 15, scale = 4)
    private BigDecimal totalFees;
    @Column(precision = 15, scale = 4)
    private BigDecimal totalNet;
    private Double chargebackRate;
    private Integer disputeCount;
    private Integer reconMismatchCount;

    private LocalDateTime generatedAt;

    private LocalDateTime periodFrom;
    private LocalDateTime periodTo;

    @PrePersist
    public void prePersist() {
        this.generatedAt = LocalDateTime.now();
    }
}


