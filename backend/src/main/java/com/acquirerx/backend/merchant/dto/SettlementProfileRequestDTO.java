package com.acquirerx.backend.merchant.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class SettlementProfileRequestDTO {

    @NotNull(message = "Merchant ID is required")
    private Long merchantId;

    @NotBlank(message = "Settlement cycle is required")
    @Pattern(regexp = "^(DAILY|T_PLUS_1|T_PLUS_2|WEEKLY)$",
            message = "Settlement cycle must be DAILY, T_PLUS_1, T_PLUS_2, or WEEKLY")
    private String settlementCycle;

    @NotBlank(message = "Bank account reference is required")
    private String bankAccountRef;

    @NotNull(message = "Reserve percentage is required")
    @Min(value = 0, message = "Reserve cannot be negative")
    @Max(value = 100, message = "Reserve cannot exceed 100%")
    private Double reservePct;

    public Long getMerchantId() { return merchantId; }
    public void setMerchantId(Long merchantId) { this.merchantId = merchantId; }
    public String getSettlementCycle() { return settlementCycle; }
    public void setSettlementCycle(String settlementCycle) { this.settlementCycle = settlementCycle; }
    public String getBankAccountRef() { return bankAccountRef; }
    public void setBankAccountRef(String bankAccountRef) { this.bankAccountRef = bankAccountRef; }
    public Double getReservePct() { return reservePct; }
    public void setReservePct(Double reservePct) { this.reservePct = reservePct; }
}