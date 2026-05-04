package com.acquirerx.ops.notification.service;

import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.NotificationCategory;
import com.acquirerx.ops.common.exception.ResourceNotFoundException;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.notification.dto.NotificationFilterDTO;
import com.acquirerx.ops.notification.dto.NotificationResponseDTO;
import com.acquirerx.ops.notification.dto.NotificationStatsDTO;
import com.acquirerx.ops.notification.entity.Notification;
import com.acquirerx.ops.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "notificationId", "userId", "status", "createdAt"
    );

    private final NotificationRepository notificationRepository;

    public void send(Long userId, String message, NotificationCategory category) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setCategory(category);

        notificationRepository.save(notification);
        log.info("Notification sent: userId={}, category={}, message={}", userId, category, message);
    }

    public PagedResponseDTO<NotificationResponseDTO> getForUser(Long userId, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Notification> notifPage = notificationRepository.findByUserId(userId, pageable);
        Page<NotificationResponseDTO> dtoPage = notifPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public PagedResponseDTO<NotificationResponseDTO> getUnreadForUser(Long userId, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Notification> notifPage = notificationRepository.findByUserIdAndStatus(userId, "UNREAD", pageable);
        Page<NotificationResponseDTO> dtoPage = notifPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public NotificationResponseDTO markAsRead(Long notificationId) {
        Notification notification = getById(notificationId);
        notification.setStatus("READ");
        return toResponse(notificationRepository.save(notification));
    }

    public NotificationResponseDTO dismiss(Long notificationId) {
        Notification notification = getById(notificationId);
        notification.setStatus("DISMISSED");
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllReadForUser(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndStatus(userId, "UNREAD");
        unread.forEach(n -> n.setStatus("READ"));
        notificationRepository.saveAll(unread);
        log.info("Marked all read for userId={}", userId);
    }

    public PagedResponseDTO<NotificationResponseDTO> searchNotifications(NotificationFilterDTO filter, PaginationParams pagination) {

        NotificationCategory categoryEnum = null;
        if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
            try {
                categoryEnum = NotificationCategory.valueOf(filter.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                        "Invalid category: " + filter.getCategory() +
                                ". Valid: BATCH, SETTLEMENT, DISPUTE, RISK, RECON");
            }
        }

        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<Notification> notifPage = notificationRepository.findByFiltersPaged(
                filter.getUserId(),
                categoryEnum,
                filter.getStatus(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getMessageContains(),
                pageable
        );

        log.info("Notification search: filters={}, total={}", filter, notifPage.getTotalElements());

        Page<NotificationResponseDTO> dtoPage = notifPage.map(this::toResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatus(userId, "UNREAD");
    }

    public NotificationStatsDTO getNotificationStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long total = notificationRepository.count();
        long unread = value(notificationRepository.countByStatus("UNREAD"));
        long read = value(notificationRepository.countByStatus("READ"));
        long dismissed = value(notificationRepository.countByStatus("DISMISSED"));

        long batch = value(notificationRepository.countByCategory(NotificationCategory.BATCH));
        long settlement = value(notificationRepository.countByCategory(NotificationCategory.SETTLEMENT));
        long dispute = value(notificationRepository.countByCategory(NotificationCategory.DISPUTE));
        long risk = value(notificationRepository.countByCategory(NotificationCategory.RISK));
        long recon = value(notificationRepository.countByCategory(NotificationCategory.RECON));

        long sentToday = value(notificationRepository.countCreatedAfter(todayStart));
        long unreadToday = value(notificationRepository.countUnreadCreatedAfter(todayStart));

        if (unread > 50) {
            log.warn("Notification stats: {} unread notifications pending!", unread);
        }

        log.info("Notification stats: total={}, unread={}, sentToday={}", total, unread, sentToday);

        return new NotificationStatsDTO(
                total, unread, read, dismissed,
                batch, settlement, dispute, risk, recon,
                sentToday, unreadToday
        );
    }

    public List<NotificationResponseDTO> getAll() {
        return notificationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Notification getById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
    }

    private NotificationResponseDTO toResponse(Notification notification) {
        NotificationResponseDTO response = new NotificationResponseDTO();
        response.setNotificationId(notification.getNotificationId());
        response.setUserId(notification.getUserId());
        response.setMessage(notification.getMessage());
        response.setCategory(notification.getCategory() != null ? notification.getCategory().name() : null);
        response.setStatus(notification.getStatus());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private long value(Long value) {
        return value == null ? 0L : value;
    }
}
