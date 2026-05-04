package com.acquirerx.backend.reporting.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

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
    private Double totalVolume;
    private Double totalFees;
    private Double totalNet;
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
