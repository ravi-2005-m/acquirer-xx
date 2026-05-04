package com.acquirerx.backend.notification.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.notification.dto.NotificationFilterDTO;
import com.acquirerx.backend.notification.dto.NotificationResponseDTO;
import com.acquirerx.backend.notification.dto.NotificationStatsDTO;
import com.acquirerx.backend.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class NotificationController {

    private final NotificationService service;

    @GetMapping("/user/{userId}")
    public ApiResponse<PagedResponseDTO<NotificationResponseDTO>> getForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Notifications fetched", service.getForUser(userId, page, size));
    }

    @GetMapping("/user/{userId}/unread")
    public ApiResponse<PagedResponseDTO<NotificationResponseDTO>> getUnread(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Unread notifications fetched", service.getUnreadForUser(userId, page, size));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ApiResponse<Long> getUnreadCount(@PathVariable Long userId) {
        return new ApiResponse<>("Unread count fetched", service.getUnreadCount(userId));
    }

    @PostMapping("/search")
    public ApiResponse<PagedResponseDTO<NotificationResponseDTO>> search(
            @Valid @RequestBody NotificationFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Notifications fetched", service.searchNotifications(filter, page, size));
    }

    @GetMapping("/stats")
    public ApiResponse<NotificationStatsDTO> getStats() {
        return new ApiResponse<>("Notification stats fetched", service.getNotificationStats());
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponseDTO> markRead(@PathVariable Long id) {
        return new ApiResponse<>("Marked as read", service.markAsRead(id));
    }

    @PatchMapping("/{id}/dismiss")
    public ApiResponse<NotificationResponseDTO> dismiss(@PathVariable Long id) {
        return new ApiResponse<>("Notification dismissed", service.dismiss(id));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ApiResponse<String> markAllRead(@PathVariable Long userId) {
        service.markAllReadForUser(userId);
        return new ApiResponse<>("All marked as read", "Done");
    }

    @GetMapping
    public ApiResponse<List<NotificationResponseDTO>> getAll() {
        return new ApiResponse<>("Notifications fetched", service.getAll());
    }
}
