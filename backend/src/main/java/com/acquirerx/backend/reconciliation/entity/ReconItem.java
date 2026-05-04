package com.acquirerx.backend.reconciliation.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "recon_item", indexes = {
        @Index(name = "idx_recon_item_file", columnList = "recon_file_id"),
        @Index(name = "idx_recon_item_match", columnList = "match_status")
})
public class ReconItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reconItemId;

    @ManyToOne
    @JoinColumn(name = "recon_file_id", nullable = false)
    private ReconFile reconFile;

    private String reference;

    private Double amount;

    private String matchStatus;

    private String notes;
}
