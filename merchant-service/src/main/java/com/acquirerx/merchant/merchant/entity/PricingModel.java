package com.acquirerx.merchant.merchant.entity;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricing_model", indexes = {
        @Index(name = "idx_pricing_merchant", columnList = "merchant_id"),
        @Index(name = "idx_pricing_status", columnList = "status")
})
public class PricingModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pricingId;

    @ManyToOne
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    private String modelType;
    @Column(precision = 15, scale = 4)
    private BigDecimal mdrPct;
    @Column(precision = 15, scale = 4)
    private BigDecimal perTxnFee;
    private String schemeFeePassThrough;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String status;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    public Long getPricingId() {
        return pricingId;
    }

    public void setPricingId(Long pricingId) {
        this.pricingId = pricingId;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public void setMerchant(Merchant merchant) {
        this.merchant = merchant;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public BigDecimal getMdrPct() {
        return mdrPct;
    }

    public void setMdrPct(BigDecimal mdrPct) {
        this.mdrPct = mdrPct;
    }

    public BigDecimal getPerTxnFee() {
        return perTxnFee;
    }

    public void setPerTxnFee(BigDecimal perTxnFee) {
        this.perTxnFee = perTxnFee;
    }

    public String getSchemeFeePassThrough() {
        return schemeFeePassThrough;
    }

    public void setSchemeFeePassThrough(String schemeFeePassThrough) {
        this.schemeFeePassThrough = schemeFeePassThrough;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
