package com.acquirerx.ops.notification.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationFilterDTO {

    private Long userId;
    private String category;
    private String status;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String messageContains;
}


