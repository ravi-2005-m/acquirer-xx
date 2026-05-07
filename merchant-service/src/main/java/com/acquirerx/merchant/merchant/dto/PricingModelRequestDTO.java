package com.acquirerx.merchant.merchant.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PricingModelRequestDTO {

    @NotNull(message = "Merchant ID is required")
    private Long merchantId;

    @NotBlank(message = "Model type is required")
    @Pattern(regexp = "^(MDR|IC_PLUS_PLUS|BLENDED)$",
            message = "Model type must be MDR, IC_PLUS_PLUS, or BLENDED")
    private String modelType;

    @NotNull(message = "MDR percentage is required")
    @DecimalMin(value = "0", message = "MDR cannot be negative")
    @DecimalMax(value = "100", message = "MDR cannot exceed 100%")
    private BigDecimal mdrPct;

    @DecimalMin(value = "0", message = "Per-txn fee cannot be negative")
    private BigDecimal perTxnFee;

    @Pattern(regexp = "^(YES|NO)$", message = "Scheme fee pass-through must be YES or NO")
    private String schemeFeePassThrough;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    public Long getMerchantId() { return merchantId; }
    public void setMerchantId(Long merchantId) { this.merchantId = merchantId; }
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
}
