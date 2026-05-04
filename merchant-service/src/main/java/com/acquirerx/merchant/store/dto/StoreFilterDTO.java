package com.acquirerx.merchant.store.dto;

import lombok.Data;

@Data
public class StoreFilterDTO {

    private String storeName;
    private String region;
    private String address;
    private String status;
    private Long merchantId;
}
