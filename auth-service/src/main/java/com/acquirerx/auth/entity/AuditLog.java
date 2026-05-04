package com.acquirerx.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_audit_actor", columnList = "actor_username"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_date", columnList = "performed_at")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditId;

    @Column(name = "actor_username")
    private String actorUsername;

    private String action;

    private String targetType;

    private String targetId;

    private String details;

    private String ipAddress;

    @Column(name = "performed_at")
    private LocalDateTime performedAt;

    @PrePersist
    public void prePersist() {
        this.performedAt = LocalDateTime.now();
    }
}
