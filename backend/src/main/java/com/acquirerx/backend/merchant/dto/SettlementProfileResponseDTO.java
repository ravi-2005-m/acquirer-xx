package com.acquirerx.backend.merchant.dto;

import java.time.LocalDateTime;

public class SettlementProfileResponseDTO {

    private Long settleProfileId;
    private Long merchantId;
    private String merchantName;
    private String settlementCycle;
    private String bankAccountRef;
    private Double reservePct;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getSettleProfileId() { return settleProfileId; }
    public void setSettleProfileId(Long settleProfileId) { this.settleProfileId = settleProfileId; }
    public Long getMerchantId() { return merchantId; }
    public void setMerchantId(Long merchantId) { this.merchantId = merchantId; }
    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }
    public String getSettlementCycle() { return settlementCycle; }
    public void setSettlementCycle(String settlementCycle) { this.settlementCycle = settlementCycle; }
    public String getBankAccountRef() { return bankAccountRef; }
    public void setBankAccountRef(String bankAccountRef) { this.bankAccountRef = bankAccountRef; }
    public Double getReservePct() { return reservePct; }
    public void setReservePct(Double reservePct) { this.reservePct = reservePct; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}