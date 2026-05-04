package com.acquirerx.backend.terminal.entity;

import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.store.entity.Store;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "terminal", indexes = {
    @Index(name = "idx_terminal_store", columnList = "store_id"),
    @Index(name = "idx_terminal_tid", columnList = "tid"),
    @Index(name = "idx_terminal_status", columnList = "status")
})
public class Terminal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long terminalId;

    private String tid;
    private String brandModel;
    private String capability;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne
    @JoinColumn(name = "param_profile_id")
    private ParamProfile paramProfile;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
