package com.acquirerx.transaction.switchmodule.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class TransactionStatsDTO {
    private double totalAmount;
    private Map<String, Long> byType;
}
