package com.acquirerx.merchant.store.entity;

import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.merchant.entity.Merchant;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "store", indexes = {
    @Index(name = "idx_store_merchant", columnList = "merchant_id"),
    @Index(name = "idx_store_status", columnList = "status")
})
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    private String storeName;
    private String address;
    private String region;
    private String city;
    private String state;
    private String pincode;
    private String contactPerson;
    private String contactPhone;

    @ManyToOne
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @Enumerated(EnumType.STRING)
    @jakarta.persistence.Column(columnDefinition = "VARCHAR(20)")
    private Status status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
