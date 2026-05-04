package com.acquirerx.backend.reconciliation.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "recon_file")
public class ReconFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reconFileId;

    private String source;

    private LocalDate fileDate;

    private Integer rowCount;

    private String status;

    private LocalDateTime loadedAt;

    @PrePersist
    public void prePersist() {
        this.loadedAt = LocalDateTime.now();
    }
}
