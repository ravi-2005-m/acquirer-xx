package com.acquirerx.merchant.merchant.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PricingModelResponseDTO {

    private Long pricingId;
    private Long merchantId;
    private String merchantName;
    private String modelType;
    private BigDecimal mdrPct;
    private BigDecimal perTxnFee;
    private String schemeFeePassThrough;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String status;
    private LocalDateTime createdAt;

    public Long getPricingId() { return pricingId; }
    public void setPricingId(Long pricingId) { this.pricingId = pricingId; }
    public Long getMerchantId() { return merchantId; }
    public void setMerchantId(Long merchantId) { this.merchantId = merchantId; }
    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }
    public String getModelType() { return modelType; }
    public void setModelType(String modelType) { this.modelType = modelType; }
    public BigDecimal getMdrPct() { return mdrPct; }
    public void setMdrPct(BigDecimal mdrPct) { this.mdrPct = mdrPct; }
    public BigDecimal getPerTxnFee() { return perTxnFee; }
    public void setPerTxnFee(BigDecimal perTxnFee) { this.perTxnFee = perTxnFee; }
    public String getSchemeFeePassThrough() { return schemeFeePassThrough; }
    public void setSchemeFeePassThrough(String schemeFeePassThrough) { this.schemeFeePassThrough = schemeFeePassThrough; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
