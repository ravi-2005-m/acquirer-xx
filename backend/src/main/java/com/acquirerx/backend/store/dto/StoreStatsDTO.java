package com.acquirerx.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StoreStatsDTO {

    private Long totalStores;
    private Long activeStores;
    private Long inactiveStores;

    private Long totalTerminals;
    private Double avgTerminalsPerStore;

    private Long uniqueRegions;
}
