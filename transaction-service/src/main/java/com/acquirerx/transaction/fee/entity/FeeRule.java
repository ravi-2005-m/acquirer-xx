package com.acquirerx.transaction.fee.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "fee_rule")
public class FeeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeRuleId;

    private String cardType;
    private String transactionType;
    @Column(precision = 15, scale = 4)
    private BigDecimal schemePercentage;
    @Column(precision = 15, scale = 4)
    private BigDecimal interchangePercentage;
    @Column(precision = 15, scale = 4)
    private BigDecimal acquirerMarkupPercentage;
    private String status;

    @Column(name = "mcc_pattern", length = 10)
    private String mccPattern;

    @Column(name = "region", length = 10)
    private String region;

    @Column(name = "min_amount", precision = 19, scale = 4)
    private BigDecimal minAmount;

    @Column(name = "max_amount", precision = 19, scale = 4)
    private BigDecimal maxAmount;

    @Column(name = "network", length = 20)
    private String network;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.priority == null) {
            this.priority = 100;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
