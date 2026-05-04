package com.acquirerx.backend.dispute.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "dispute_document")
public class DisputeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long docId;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private DisputeCase disputeCase;

    private String docType;

    private String uri;

    private LocalDateTime uploadedDate;

    @PrePersist
    public void prePersist() {
        this.uploadedDate = LocalDateTime.now();
    }
}
