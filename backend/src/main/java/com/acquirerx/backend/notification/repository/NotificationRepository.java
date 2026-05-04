package com.acquirerx.backend.notification.repository;

import com.acquirerx.backend.common.enums.NotificationCategory;
import com.acquirerx.backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndStatus(Long userId, String status);

    Page<Notification> findByUserIdAndStatus(Long userId, String status, Pageable pageable);

    List<Notification> findByCategory(NotificationCategory category);

    @Query("SELECT n FROM Notification n WHERE " +
           "(:userId IS NULL OR n.userId = :userId) AND " +
           "(:category IS NULL OR n.category = :category) AND " +
           "(:status IS NULL OR n.status = :status) AND " +
           "(:fromDate IS NULL OR n.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR n.createdAt <= :toDate) AND " +
           "(:messageContains IS NULL OR LOWER(n.message) LIKE LOWER(CONCAT('%', :messageContains, '%')))")
    Page<Notification> findByFiltersPaged(
            @Param("userId") Long userId,
            @Param("category") NotificationCategory category,
            @Param("status") String status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("messageContains") String messageContains,
            Pageable pageable);

    Long countByStatus(String status);

    Long countByCategory(NotificationCategory category);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.createdAt >= :fromDate")
    Long countCreatedAfter(@Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.createdAt >= :fromDate AND n.status = 'UNREAD'")
    Long countUnreadCreatedAfter(@Param("fromDate") LocalDateTime fromDate);

    Long countByUserIdAndStatus(Long userId, String status);
}
