package com.acquirerx.ops.reporting.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TxnVolumeDTO {
    private long totalTxns;
    private long settledTxns;
    private long unsettledTxns;
    private double settledAmount;
    private double totalFees;
}
