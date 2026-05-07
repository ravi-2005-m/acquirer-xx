package com.acquirerx.transaction.switchmodule.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.acquirerx.transaction.switchmodule.enums.TxnStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "auth_message", indexes = {
    @Index(name = "idx_auth_terminal", columnList = "terminal_id"),
    @Index(name = "idx_auth_merchant", columnList = "merchant_id"),
    @Index(name = "idx_auth_status", columnList = "status")
})
public class AuthMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authId;

    @Column(name = "pan_masked", length = 19)
    private String panMasked;
    private String txnType;
    @Column(precision = 15, scale = 4)
    private BigDecimal amount;
    private String currency;
    private String authCode;
    private String responseCode;
    private String network;

    @Enumerated(EnumType.STRING)
    private TxnStatus status;

    private Integer riskScore;
    private String riskReason;
    private Long originalAuthId;
    private LocalDateTime txnTime;

    @Column(name = "terminal_id")
    private Long terminalId;

    @Column(name = "merchant_id")
    private Long merchantId;

    private String tid;
    private String merchantName;

    @Column(name = "merchant_mcc")
    private String merchantMcc;

    @Column(name = "merchant_region")
    private String merchantRegion;

    @PrePersist
    public void prePersist() {
        this.txnTime = LocalDateTime.now();
    }
}
