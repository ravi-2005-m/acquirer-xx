package com.acquirerx.auth.service;

import com.acquirerx.auth.common.dto.PagedResponseDTO;
import com.acquirerx.auth.common.pagination.PaginationParams;
import com.acquirerx.auth.dto.AuditFilterDTO;
import com.acquirerx.auth.dto.AuditLogResponseDTO;
import com.acquirerx.auth.entity.AuditLog;
import com.acquirerx.auth.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "auditId", "actorUsername", "action", "targetId", "performedAt"
    );

    private final AuditLogRepository auditLogRepository;

    public void logAction(String actorUsername, String action,
                          String targetType, String targetId,
                          String details) {

        AuditLog entry = new AuditLog();
        entry.setActorUsername(actorUsername);
        entry.setAction(action);
        entry.setTargetType(targetType);
        entry.setTargetId(targetId);
        entry.setDetails(details);

        auditLogRepository.save(entry);
        log.info("Audit: actor={}, action={}, target={}, details={}",
                actorUsername, action, targetId, details);
    }

    public PagedResponseDTO<AuditLogResponseDTO> getAllLogs(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AuditLog> logPage = auditLogRepository.findAll(pageable);
        Page<AuditLogResponseDTO> dtoPage = logPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<AuditLogResponseDTO> searchLogs(AuditFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AuditLog> logPage = auditLogRepository.findByFiltersPaged(
                filter.getActorUsername(),
                filter.getAction(),
                filter.getTargetId(),
                filter.getFromDate(),
                filter.getToDate(),
                pageable
        );

        Page<AuditLogResponseDTO> dtoPage = logPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<AuditLogResponseDTO> getLogsByActor(String actorUsername, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<AuditLog> logPage = auditLogRepository.findByActorUsername(actorUsername, pageable);
        Page<AuditLogResponseDTO> dtoPage = logPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    private AuditLogResponseDTO toResponse(AuditLog auditLog) {
        AuditLogResponseDTO dto = new AuditLogResponseDTO();
        dto.setAuditId(auditLog.getAuditId());
        dto.setActorUsername(auditLog.getActorUsername());
        dto.setAction(auditLog.getAction());
        dto.setTargetType(auditLog.getTargetType());
        dto.setTargetId(auditLog.getTargetId());
        dto.setDetails(auditLog.getDetails());
        dto.setPerformedAt(auditLog.getPerformedAt());
        return dto;
    }
}
