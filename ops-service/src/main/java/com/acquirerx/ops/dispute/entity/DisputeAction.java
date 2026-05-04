package com.acquirerx.ops.dispute.entity;

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
@Table(name = "dispute_action")
public class DisputeAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long actionId;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private DisputeCase disputeCase;

    private String actionType;

    private Long actorId;

    private String notes;

    private LocalDateTime actionDate;

    @PrePersist
    public void prePersist() {
        this.actionDate = LocalDateTime.now();
    }
}


