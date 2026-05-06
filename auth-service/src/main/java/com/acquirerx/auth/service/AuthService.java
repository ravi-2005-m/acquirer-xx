package com.acquirerx.auth.service;

import com.acquirerx.auth.common.dto.PagedResponseDTO;
import com.acquirerx.auth.common.exception.ResourceNotFoundException;
import com.acquirerx.auth.common.pagination.PaginationParams;
import com.acquirerx.auth.config.security.JwtUtil;
import com.acquirerx.auth.dto.*;
import com.acquirerx.auth.entity.User;
import com.acquirerx.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "userId", "username", "email", "name", "role", "status", "createdAt"
    );

    private static final Set<String> ALLOWED_ROLES = Set.of(
            "ADMIN", "RISK", "DISPUTES", "RECON", "MERCHANT_OPS", "POS_OPS"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    // ── REGISTER ─────────────────────────────
    public LoginResponseDTO register(RegisterRequestDTO dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException(
                    "Username already exists: " + dto.getUsername());
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already exists: " + dto.getEmail());
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole() != null ? dto.getRole() : "MERCHANT_OPS");
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPhone(dto.getPhone());

        userRepository.save(user);
        auditService.logAction(
            dto.getUsername(),
            "REGISTER",
            "USER",
            dto.getUsername(),
            "New user registration"
        );
        log.info("User registered: username={}, role={}", dto.getUsername(), dto.getRole());

        String token = jwtUtil.generateToken(dto.getUsername(), user.getRole(), user.getUserId());
        return new LoginResponseDTO(token, dto.getUsername(), user.getRole(),
                "Registration successful");
    }

    // ── LOGIN ─────────────────────────────────
    public LoginResponseDTO login(LoginRequestDTO dto) {

        User user = userRepository.findByUsername(dto.getUsername())
            .orElseThrow(() -> {
                auditService.logAction(
                    dto.getUsername(),
                    "LOGIN_FAILED",
                    "USER",
                    dto.getUsername(),
                    "Invalid username or password"
                );
                return new IllegalArgumentException("Invalid username or password");
            });

        if (user.getStatus() != null && "INACTIVE".equals(user.getStatus().toString())) {
            auditService.logAction(
                user.getUsername(),
                "LOGIN_BLOCKED",
                "USER",
                String.valueOf(user.getUserId()),
                "Attempted login on inactive account"
            );
            throw new IllegalStateException("Account is inactive");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            auditService.logAction(
                user.getUsername(),
                "LOGIN_FAILED",
                "USER",
                String.valueOf(user.getUserId()),
                "Invalid password"
            );
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getUserId());
        auditService.logAction(
            user.getUsername(),
            "LOGIN_SUCCESS",
            "USER",
            String.valueOf(user.getUserId()),
            "Successful login"
        );
        log.info("User logged in: username={}, role={}", user.getUsername(), user.getRole());

        return new LoginResponseDTO(token, user.getUsername(), user.getRole(),
                "Login successful");
    }

    public PagedResponseDTO<UserResponseDTO> getAllUsers(PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<User> userPage = userRepository.findAll(pageable);
        Page<UserResponseDTO> dtoPage = userPage.map(this::toUserResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return toUserResponse(user);
    }

    public UserResponseDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return toUserResponse(user);
    }

    public UserResponseDTO updateMyProfile(String username, String email, String name, String phone) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        boolean changed = false;
        if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(email);
            changed = true;
        }
        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
            changed = true;
        }
        if (phone != null && !phone.equals(user.getPhone())) {
            user.setPhone(phone);
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
        }
        return toUserResponse(user);
    }

    public void changeMyPassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", username);
    }

    public PagedResponseDTO<UserResponseDTO> searchUsers(UserFilterDTO filter, PaginationParams pagination) {
        pagination.validateSortField(SORTABLE_FIELDS);
        Pageable pageable = pagination.toPageable();

        Page<User> userPage = userRepository.findByFiltersPaged(
            filter.getUsername(),
            filter.getEmail(),
            filter.getRole(),
            filter.getStatus(),
            pageable
        );

        Page<UserResponseDTO> dtoPage = userPage.map(this::toUserResponse);
        return new PagedResponseDTO<>(dtoPage);
    }

    public void deactivateUser(Long userId, String actorUsername) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (actorUsername.equals(user.getUsername())) {
            throw new IllegalArgumentException("You cannot deactivate your own account");
        }

        user.setStatus(com.acquirerx.auth.common.enums.Status.INACTIVE);
        userRepository.save(user);

        auditService.logAction(
            actorUsername,
            "USER_DEACTIVATED",
            "USER",
            String.valueOf(userId),
            "Deactivated user: " + user.getUsername()
        );
    }

    public void reactivateUser(Long userId, String actorUsername) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(com.acquirerx.auth.common.enums.Status.ACTIVE);
        userRepository.save(user);

        auditService.logAction(
            actorUsername,
            "USER_REACTIVATED",
            "USER",
            String.valueOf(userId),
            "Reactivated user: " + user.getUsername()
        );
    }

    public void changeRole(Long userId, String newRole, String actorUsername) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (actorUsername.equals(user.getUsername())) {
            throw new IllegalArgumentException("You cannot change your own role");
        }

        String normalised = newRole == null ? "" : newRole.trim().toUpperCase();
        if (!ALLOWED_ROLES.contains(normalised)) {
            throw new IllegalArgumentException("Invalid role: " + newRole +
                ". Allowed: " + ALLOWED_ROLES);
        }

        String oldRole = user.getRole();
        user.setRole(normalised);
        userRepository.save(user);

        auditService.logAction(
            actorUsername,
            "ROLE_CHANGED",
            "USER",
            String.valueOf(userId),
            "Role changed from " + oldRole + " to " + newRole.toUpperCase()
        );
    }

    private UserResponseDTO toUserResponse(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus() != null ? user.getStatus().toString() : "ACTIVE");
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
