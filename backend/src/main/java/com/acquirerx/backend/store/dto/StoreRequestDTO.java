package com.acquirerx.backend.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoreRequestDTO {

    @NotBlank(message = "Store name is required")
    @Size(min = 2, max = 200, message = "Store name must be 2-200 characters")
    private String storeName;

    private String address;

    private String region;
}
