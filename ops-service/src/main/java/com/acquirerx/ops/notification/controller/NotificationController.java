package com.acquirerx.ops.notification.controller;

import com.acquirerx.ops.common.dto.PagedResponseDTO;
import com.acquirerx.ops.common.NotificationCategory;
import com.acquirerx.ops.common.pagination.PaginationParams;
import com.acquirerx.ops.common.response.ApiResponse;
import com.acquirerx.ops.notification.dto.NotificationFilterDTO;
import com.acquirerx.ops.notification.dto.NotificationResponseDTO;
import com.acquirerx.ops.notification.dto.NotificationStatsDTO;
import com.acquirerx.ops.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "12. Notifications")
@Validated
public class NotificationController {

    private final NotificationService service;

    @GetMapping("/user/{userId:\\d+}")
    public ApiResponse<PagedResponseDTO<NotificationResponseDTO>> getForUser(
            @PathVariable Long userId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Notifications fetched", service.getForUser(userId, pagination));
    }

    @GetMapping("/user/{userId:\\d+}/unread")
    public ApiResponse<PagedResponseDTO<NotificationResponseDTO>> getUnread(
            @PathVariable Long userId,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Unread notifications fetched", service.getUnreadForUser(userId, pagination));
    }

    @GetMapping("/user/{userId:\\d+}/unread-count")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        return new ApiResponse<>("Unread count fetched", service.getUnreadCount(userId));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<NotificationResponseDTO>> search(
            @Valid @RequestBody NotificationFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Notifications fetched", service.searchNotifications(filter, pagination));
    }

    @GetMapping("/stats")
    public ApiResponse<NotificationStatsDTO> getStats() {
        return new ApiResponse<>("Notification stats fetched", service.getNotificationStats());
    }

    @PatchMapping("/{id:\\d+}/read")
    public ApiResponse<NotificationResponseDTO> markRead(@PathVariable Long id) {
        return new ApiResponse<>("Marked as read", service.markAsRead(id));
    }

    @PatchMapping("/{id:\\d+}/dismiss")
    public ApiResponse<NotificationResponseDTO> dismiss(@PathVariable Long id) {
        return new ApiResponse<>("Notification dismissed", service.dismiss(id));
    }

    @PatchMapping("/user/{userId:\\d+}/read-all")
    public ApiResponse<String> markAllRead(@PathVariable Long userId) {
        service.markAllReadForUser(userId);
        return new ApiResponse<>("All marked as read", "Done");
    }

    @GetMapping
    public ApiResponse<List<NotificationResponseDTO>> getAll() {
        return new ApiResponse<>("Notifications fetched", service.getAll());
    }

    @PostMapping("/send")
    public ApiResponse<NotificationResponseDTO> sendNotification(
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam String category) {
        NotificationCategory cat = NotificationCategory.valueOf(category.toUpperCase());
        service.send(userId, message, cat);
        return new ApiResponse<>("Notification sent", null);
    }
}
