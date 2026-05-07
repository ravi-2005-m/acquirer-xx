package com.acquirerx.transaction.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TxnStatsDTO {
    private long totalTxns;
    private long settledTxns;
    private long unsettledTxns;
    private BigDecimal settledAmount;
    private BigDecimal totalFees;
}
