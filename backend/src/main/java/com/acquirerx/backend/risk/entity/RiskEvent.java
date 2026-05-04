package com.acquirerx.backend.risk.entity;

import com.acquirerx.backend.fee.entity.Txn;
import jakarta.persistence.Entity;
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
@Table(name = "risk_event", indexes = {
        @Index(name = "idx_risk_event_txn", columnList = "txn_id"),
        @Index(name = "idx_risk_event_result", columnList = "result")
})
public class RiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long riskEventId;

    @ManyToOne
    @JoinColumn(name = "txn_id")
    private Txn txn;

    @ManyToOne
    @JoinColumn(name = "rule_id")
    private RiskRule rule;

    private Integer score;

    private String result;

    private LocalDateTime eventDate;

    @PrePersist
    public void prePersist() {
        this.eventDate = LocalDateTime.now();
    }
}
