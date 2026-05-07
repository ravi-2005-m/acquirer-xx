package com.acquirerx.transaction.fee.entity;

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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "txn", indexes = {
    @Index(name = "idx_txn_merchant", columnList = "merchant_id"),
    @Index(name = "idx_txn_status", columnList = "status"),
    @Index(name = "idx_txn_settled", columnList = "settled")
})
public class Txn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long txnId;

    @Column(name = "auth_id")
    private Long authId;

    @Column(name = "merchant_id")
    private Long merchantId;

    @Column(name = "store_id")
    private Long storeId;

    @Column(name = "terminal_id")
    private Long terminalId;

    @Column(precision = 15, scale = 4)
    private BigDecimal amount;
    private String currency;

    @Column(name = "scheme_fee", precision = 19, scale = 4)
    private BigDecimal schemeFee = BigDecimal.ZERO;

    @Column(name = "interchange_fee", precision = 19, scale = 4)
    private BigDecimal interchangeFee = BigDecimal.ZERO;

    @Column(name = "acquirer_markup", precision = 19, scale = 4)
    private BigDecimal acquirerMarkup = BigDecimal.ZERO;

    @Column(name = "total_fee", precision = 19, scale = 4)
    private BigDecimal totalFee = BigDecimal.ZERO;

    @Column(name = "net_merchant_amount", precision = 19, scale = 4)
    private BigDecimal netMerchantAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private TxnStatus status;

    private boolean settled;
    private LocalDateTime txnDate;

    private String merchantName;
    private String tid;

    @PrePersist
    public void prePersist() {
        this.txnDate = LocalDateTime.now();
        this.settled = false;
    }
}
