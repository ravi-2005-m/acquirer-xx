package com.acquirerx.settlement.settlement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "adjustment")
public class Adjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adjustmentId;

    @Column(name = "merchant_id")
    private Long merchantId;

    @Column(name = "txn_id")
    private Long txnId;

    @Column(name = "settle_batch_id")
    private Long settleBatchId;

    @Column(precision = 15, scale = 4)
    private BigDecimal amount;
    private String reason;
    private String type;
    private String status;
    private LocalDateTime postedDate;

    @PrePersist
    public void prePersist() {
        this.postedDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = "APPLIED";
        }
    }
}
