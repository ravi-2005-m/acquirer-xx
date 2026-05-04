package com.acquirerx.backend.iam.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.iam.dto.AuditFilterDTO;
import com.acquirerx.backend.iam.dto.AuditLogResponseDTO;
import com.acquirerx.backend.iam.entity.AuditLog;
import com.acquirerx.backend.iam.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

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

    public PagedResponseDTO<AuditLogResponseDTO> getAllLogs(int page, int size) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "performedAt")
        );

        Page<AuditLog> logPage = auditLogRepository.findAll(pageRequest);
        Page<AuditLogResponseDTO> dtoPage = logPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<AuditLogResponseDTO> searchLogs(
            AuditFilterDTO filter, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "performedAt")
        );

        Page<AuditLog> logPage = auditLogRepository.findByFiltersPaged(
                filter.getActorUsername(),
                filter.getAction(),
                filter.getTargetId(),
                filter.getFromDate(),
                filter.getToDate(),
                pageRequest
        );

        Page<AuditLogResponseDTO> dtoPage = logPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<AuditLogResponseDTO> getLogsByActor(
            String actorUsername, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "performedAt")
        );

        Page<AuditLog> logPage = auditLogRepository.findByActorUsername(actorUsername, pageRequest);
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
