package com.acquirerx.merchant.store.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StoreResponseDTO {

    private Long storeId;
    private String storeName;
    private String address;
    private String region;
    private String city;
    private String state;
    private String pincode;
    private String contactPerson;
    private String contactPhone;
    private String status;
    private Long merchantId;
    private String merchantName;
    private LocalDateTime createdAt;
}
