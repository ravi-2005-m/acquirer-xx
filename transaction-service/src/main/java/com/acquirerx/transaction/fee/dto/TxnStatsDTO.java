package com.acquirerx.transaction.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TxnStatsDTO {
    private long totalTxns;
    private long settledTxns;
    private long unsettledTxns;
    private double settledAmount;
    private double totalFees;
}
