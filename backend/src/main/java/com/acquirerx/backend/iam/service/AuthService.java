package com.acquirerx.backend.iam.service;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.iam.dto.LoginRequestDTO;
import com.acquirerx.backend.iam.dto.LoginResponseDTO;
import com.acquirerx.backend.iam.dto.RegisterRequestDTO;
import com.acquirerx.backend.iam.dto.UserFilterDTO;
import com.acquirerx.backend.iam.dto.UserResponseDTO;
import com.acquirerx.backend.iam.entity.User;
import com.acquirerx.backend.iam.repository.UserRepository;
import com.acquirerx.backend.iam.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

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

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setEmail(dto.getEmail());

        userRepository.save(user);
        auditService.logAction(
            dto.getUsername(),
            "REGISTER",
            "USER",
            dto.getUsername(),
            "New user registration"
        );
        log.info("User registered: username={}, role={}", dto.getUsername(), dto.getRole());

        String token = jwtUtil.generateToken(dto.getUsername(), dto.getRole());
        return new LoginResponseDTO(token, dto.getUsername(), dto.getRole(),
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

        if ("INACTIVE".equals(user.getStatus())) {
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

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
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

        public PagedResponseDTO<UserResponseDTO> getAllUsers(int page, int size) {
        PageRequest pageRequest = PageRequest.of(
            page,
            size,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<User> userPage = userRepository.findAll(pageRequest);
        Page<UserResponseDTO> dtoPage = userPage.map(this::toUserResponse);
        return new PagedResponseDTO<>(dtoPage);
        }

        public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return toUserResponse(user);
        }

        public PagedResponseDTO<UserResponseDTO> searchUsers(UserFilterDTO filter, int page, int size) {
        PageRequest pageRequest = PageRequest.of(
            page,
            size,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<User> userPage = userRepository.findByFiltersPaged(
            filter.getUsername(),
            filter.getEmail(),
            filter.getRole(),
            filter.getStatus(),
            pageRequest
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

        user.setStatus("INACTIVE");
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

        user.setStatus("ACTIVE");
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

        String oldRole = user.getRole();
        user.setRole(newRole.toUpperCase());
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
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
        }
}
