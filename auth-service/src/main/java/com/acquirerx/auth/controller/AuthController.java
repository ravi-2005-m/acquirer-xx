package com.acquirerx.auth.controller;

import com.acquirerx.auth.common.dto.PagedResponseDTO;
import com.acquirerx.auth.common.pagination.PaginationParams;
import com.acquirerx.auth.common.response.ApiResponse;
import com.acquirerx.auth.config.security.JwtUtil;
import com.acquirerx.auth.dto.*;
import com.acquirerx.auth.service.AuditService;
import com.acquirerx.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "1. Auth & IAM")
@Validated
public class AuthController {

    private final AuthService authService;
    private final AuditService auditService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user with username, password (BCrypt hashed), role, and email. " +
                    "Roles: ADMIN, RISK, DISPUTES, RECON, MERCHANT_OPS"
    )
    @PostMapping("/register")
    public ApiResponse<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return new ApiResponse<>("User registered", authService.register(dto));
    }

    @Operation(
            summary = "Login and get JWT token",
            description = "Returns JWT token on successful login. " +
                    "Use token in Authorization header: Bearer <token>"
    )
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return new ApiResponse<>("Login successful", authService.login(dto));
    }

    @Operation(
            summary = "Validate JWT token",
            description = "Validates a JWT token and returns username + role. " +
                    "Used by API Gateway to verify tokens before routing. " +
                    "Authorization header format: Bearer <token>"
    )
    @GetMapping("/validate")
    public ApiResponse<Map<String, Object>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isValid(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);

        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("username", username);
        result.put("role", role);

        return new ApiResponse<>("Token is valid", result);
    }

    @GetMapping("/users")
    public ApiResponse<PagedResponseDTO<UserResponseDTO>> getAllUsers(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Users fetched", authService.getAllUsers(pagination));
    }

    @GetMapping("/users/{id:\\d+}")
    public ApiResponse<UserResponseDTO> getUserById(@PathVariable("id") Long userId) {
        return new ApiResponse<>("User fetched", authService.getUserById(userId));
    }

    @PostMapping("/users/search")
    public ApiResponse<PagedResponseDTO<UserResponseDTO>> searchUsers(
            @Valid @RequestBody UserFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Users search completed", authService.searchUsers(filter, pagination));
    }

    @PatchMapping("/users/{id:\\d+}/deactivate")
    public ApiResponse<String> deactivateUser(@PathVariable("id") Long userId) {
        authService.deactivateUser(userId, getCurrentUsername());
        return new ApiResponse<>("User deactivated", "OK");
    }

    @PatchMapping("/users/{id:\\d+}/reactivate")
    public ApiResponse<String> reactivateUser(@PathVariable("id") Long userId) {
        authService.reactivateUser(userId, getCurrentUsername());
        return new ApiResponse<>("User reactivated", "OK");
    }

    @PatchMapping("/users/{id:\\d+}/role")
    public ApiResponse<String> changeRole(
            @PathVariable("id") Long userId,
            @RequestParam String role) {
        authService.changeRole(userId, role, getCurrentUsername());
        return new ApiResponse<>("User role changed", "OK");
    }

    @GetMapping("/audit")
    public ApiResponse<PagedResponseDTO<AuditLogResponseDTO>> getAllAuditLogs(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Audit logs fetched", auditService.getAllLogs(pagination));
    }

    @PostMapping("/audit/search")
    public ApiResponse<PagedResponseDTO<AuditLogResponseDTO>> searchAuditLogs(
            @Valid @RequestBody AuditFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Audit search completed", auditService.searchLogs(filter, pagination));
    }

    @GetMapping("/audit/actor/{username}")
    public ApiResponse<PagedResponseDTO<AuditLogResponseDTO>> getAuditByActor(
            @PathVariable("username") String username,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Audit logs by actor fetched", auditService.getLogsByActor(username, pagination));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
