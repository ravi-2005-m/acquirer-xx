package com.acquirerx.backend.switchmodule.entity;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import com.acquirerx.backend.terminal.entity.Terminal;
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
@Table(name = "auth_message", indexes = {
    @Index(name = "idx_auth_terminal", columnList = "terminal_id"),
    @Index(name = "idx_auth_merchant", columnList = "merchant_id"),
    @Index(name = "idx_auth_status", columnList = "status")
})
public class AuthMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authId;

    private String panMasked;

    private String txnType;

    private Double amount;

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

    @ManyToOne
    @JoinColumn(name = "terminal_id")
    private Terminal terminal;

    @ManyToOne
    @JoinColumn(name = "merchant_id")
    private Merchant merchant;

    @PrePersist
    public void prePersist() {
        this.txnTime = LocalDateTime.now();
    }
}
