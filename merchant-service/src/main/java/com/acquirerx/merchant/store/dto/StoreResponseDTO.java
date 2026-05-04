package com.acquirerx.merchant.store.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StoreResponseDTO {

    private Long storeId;
    private String storeName;
    private String address;
    private String region;
    private String status;
    private Long merchantId;
    private String merchantName;
    private LocalDateTime createdAt;
}
