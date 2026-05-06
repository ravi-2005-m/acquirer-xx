package com.acquirerx.auth.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDTO {

    private Long userId;
    private String username;
    private String email;
    private String name;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}
