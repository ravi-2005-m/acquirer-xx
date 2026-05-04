package com.acquirerx.backend.iam.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.iam.dto.AuditFilterDTO;
import com.acquirerx.backend.iam.dto.AuditLogResponseDTO;
import com.acquirerx.backend.iam.dto.LoginRequestDTO;
import com.acquirerx.backend.iam.dto.LoginResponseDTO;
import com.acquirerx.backend.iam.dto.RegisterRequestDTO;
import com.acquirerx.backend.iam.dto.UserFilterDTO;
import com.acquirerx.backend.iam.dto.UserResponseDTO;
import com.acquirerx.backend.iam.service.AuditService;
import com.acquirerx.backend.iam.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "1. Auth & IAM")
public class AuthController {

    private final AuthService authService;
    private final AuditService auditService;

    // POST /auth/register — Register a new user (PUBLIC — no token needed)
    @Operation(
            summary = "Register a new user",
            description = "Creates a new user with username, password (BCrypt hashed), role, and email. " +
                    "Roles: ADMIN, RISK, DISPUTES, RECON, MERCHANT_OPS"
    )
    @PostMapping("/register")
    public ApiResponse<LoginResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO dto) {
        return new ApiResponse<>("User registered", authService.register(dto));
    }

    // POST /auth/login — Login and get JWT token (PUBLIC — no token needed)
    @Operation(
            summary = "Login and get JWT token",
            description = "Returns JWT token on successful login. " +
                    "Use token in Authorization header: Bearer <token>"
    )
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO dto) {
        return new ApiResponse<>("Login successful", authService.login(dto));
    }

    @GetMapping("/users")
    public ApiResponse<PagedResponseDTO<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Users fetched", authService.getAllUsers(page, size));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<UserResponseDTO> getUserById(@PathVariable("id") Long userId) {
        return new ApiResponse<>("User fetched", authService.getUserById(userId));
    }

    @PostMapping("/users/search")
    public ApiResponse<PagedResponseDTO<UserResponseDTO>> searchUsers(
            @Valid @RequestBody UserFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Users search completed", authService.searchUsers(filter, page, size));
    }

    @PatchMapping("/users/{id}/deactivate")
    public ApiResponse<String> deactivateUser(@PathVariable("id") Long userId) {
        authService.deactivateUser(userId, getCurrentUsername());
        return new ApiResponse<>("User deactivated", "OK");
    }

    @PatchMapping("/users/{id}/reactivate")
    public ApiResponse<String> reactivateUser(@PathVariable("id") Long userId) {
        authService.reactivateUser(userId, getCurrentUsername());
        return new ApiResponse<>("User reactivated", "OK");
    }

    @PatchMapping("/users/{id}/role")
    public ApiResponse<String> changeRole(
            @PathVariable("id") Long userId,
            @RequestParam String role) {
        authService.changeRole(userId, role, getCurrentUsername());
        return new ApiResponse<>("User role changed", "OK");
    }

    @GetMapping("/audit")
    public ApiResponse<PagedResponseDTO<AuditLogResponseDTO>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Audit logs fetched", auditService.getAllLogs(page, size));
    }

    @PostMapping("/audit/search")
    public ApiResponse<PagedResponseDTO<AuditLogResponseDTO>> searchAuditLogs(
            @Valid @RequestBody AuditFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Audit search completed", auditService.searchLogs(filter, page, size));
    }

    @GetMapping("/audit/actor/{username}")
    public ApiResponse<PagedResponseDTO<AuditLogResponseDTO>> getAuditByActor(
            @PathVariable("username") String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Audit logs by actor fetched", auditService.getLogsByActor(username, page, size));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
