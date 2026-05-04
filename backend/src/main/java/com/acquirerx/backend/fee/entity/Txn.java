package com.acquirerx.backend.fee.entity;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.store.entity.Store;
import com.acquirerx.backend.switchmodule.entity.AuthMessage;
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
@Table(name = "txn", indexes = {
        @Index(name = "idx_txn_merchant", columnList = "merchant_id"),
        @Index(name = "idx_txn_status", columnList = "status"),
        @Index(name = "idx_txn_settled", columnList = "settled")
})
@Data
public class Txn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long txnId;

    @ManyToOne
    @JoinColumn(name = "auth_id")
    private AuthMessage authMessage;

    @ManyToOne
    @JoinColumn(name = "merchant_id")
    private Merchant merchant;

    @ManyToOne
    @JoinColumn(name = "store_id")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "terminal_id")
    private Terminal terminal;

    private Double amount;

    private String currency;

    private Double schemeFee;
    private Double interchangeFee;
    private Double acquirerMarkup;
    private Double totalFee;
    private Double netMerchantAmount;

    @Enumerated(EnumType.STRING)
    private TxnStatus status;

    private boolean settled;

    private LocalDateTime txnDate;

    @PrePersist
    public void prePersist() {
        this.txnDate = LocalDateTime.now();
        this.settled = false;
    }
}
