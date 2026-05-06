package com.acquirerx.auth.controller;

import com.acquirerx.auth.common.response.ApiResponse;
import com.acquirerx.auth.dto.UserResponseDTO;
import com.acquirerx.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/iam")
@RequiredArgsConstructor
public class IamController {

    private final AuthService authService;

    @GetMapping("/me")
    public ApiResponse<UserResponseDTO> getMyProfile() {
        return new ApiResponse<>("Profile fetched", authService.getUserByUsername(getCurrentUsername()));
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponseDTO> updateMyProfile(@RequestBody Map<String, Object> payload) {
        String email = payload.get("email") != null ? payload.get("email").toString() : null;
        String name  = payload.get("name")  != null ? payload.get("name").toString()  : null;
        String phone = payload.get("phone") != null ? payload.get("phone").toString() : null;
        return new ApiResponse<>("Profile updated",
                authService.updateMyProfile(getCurrentUsername(), email, name, phone));
    }

    @PostMapping("/me/change-password")
    public ApiResponse<String> changePassword(@RequestBody Map<String, String> payload) {
        authService.changeMyPassword(
            getCurrentUsername(),
            payload.get("currentPassword"),
            payload.get("newPassword")
        );
        return new ApiResponse<>("Password changed", "OK");
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
