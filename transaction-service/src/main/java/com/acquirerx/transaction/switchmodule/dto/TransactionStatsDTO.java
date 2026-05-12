package com.acquirerx.transaction.switchmodule.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
public class TransactionStatsDTO {
    private Long totalTransactions;
    private BigDecimal totalAmount;
    private Map<String, Long> byType;
}
