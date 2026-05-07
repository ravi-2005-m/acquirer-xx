package com.acquirerx.merchant.merchant.entity;

import java.time.LocalDateTime;

import com.acquirerx.merchant.common.enums.RiskLevel;
import com.acquirerx.merchant.common.enums.Status;

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

@Entity
@Data
@Table(name = "merchant", indexes = {
    @Index(name = "idx_merchant_status", columnList = "status")
})
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long merchantId;

    private String legalName;
    private String doingBusinessAs;
    private String mcc;
    private String contactInfo;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @jakarta.persistence.Column(columnDefinition = "VARCHAR(20)")
    private Status status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
