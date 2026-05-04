package com.acquirerx.transaction.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeBreakdownDTO {

    private BigDecimal schemeFee;
    private BigDecimal interchangeFee;
    private BigDecimal acquirerMarkup;
    private BigDecimal totalFee;
    private BigDecimal netMerchantAmount;

    public static FeeBreakdownDTO empty(BigDecimal amount) {
        return FeeBreakdownDTO.builder()
                .schemeFee(BigDecimal.ZERO)
                .interchangeFee(BigDecimal.ZERO)
                .acquirerMarkup(BigDecimal.ZERO)
                .totalFee(BigDecimal.ZERO)
                .netMerchantAmount(amount)
                .build();
    }
}