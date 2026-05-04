package com.acquirerx.backend.terminal.controller;

import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.terminal.dto.ParamProfileRequestDTO;
import com.acquirerx.backend.terminal.dto.ParamProfileResponseDTO;
import com.acquirerx.backend.terminal.dto.TerminalHealthResponseDTO;
import com.acquirerx.backend.terminal.service.TerminalProvisioningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/terminals/provisioning")
@RequiredArgsConstructor
@Tag(name = "4. Terminals")
public class TerminalProvisioningController {

    private final TerminalProvisioningService service;

    @Operation(summary = "Create parameter profile")
    @PostMapping("/profiles")
    public ApiResponse<ParamProfileResponseDTO> createProfile(@Valid @RequestBody ParamProfileRequestDTO dto) {
        return new ApiResponse<>("Profile created", service.createProfile(dto));
    }

    @Operation(summary = "Update parameter profile")
    @PutMapping("/profiles/{profileId}")
    public ApiResponse<ParamProfileResponseDTO> updateProfile(@PathVariable Long profileId,
                                                              @Valid @RequestBody ParamProfileRequestDTO dto) {
        return new ApiResponse<>("Profile updated", service.updateProfile(profileId, dto));
    }

    @Operation(summary = "Deactivate parameter profile")
    @PatchMapping("/profiles/{profileId}/deactivate")
    public ApiResponse<ParamProfileResponseDTO> deactivateProfile(@PathVariable Long profileId) {
        return new ApiResponse<>("Profile deactivated", service.deactivateProfile(profileId));
    }

    @Operation(summary = "Get all active parameter profiles")
    @GetMapping("/profiles/active")
    public ApiResponse<List<ParamProfileResponseDTO>> getActiveProfiles() {
        return new ApiResponse<>("Active profiles fetched", service.getAllActiveProfiles());
    }

    @Operation(summary = "Get all parameter profiles")
    @GetMapping("/profiles")
    public ApiResponse<List<ParamProfileResponseDTO>> getAllProfiles() {
        return new ApiResponse<>("Profiles fetched", service.getAllProfiles());
    }

    @Operation(summary = "Assign profile to terminal")
    @PostMapping("/profiles/{profileId}/assign/{terminalId}")
    public ApiResponse<String> assignProfile(@PathVariable Long profileId, @PathVariable Long terminalId) {
        return new ApiResponse<>("Profile assigned", service.assignProfileToTerminal(terminalId, profileId));
    }

    @Operation(summary = "Record terminal health ping")
    @PostMapping("/health/{terminalId}")
    public ApiResponse<TerminalHealthResponseDTO> recordHealthPing(@PathVariable Long terminalId,
                                                                    @RequestParam(required = false) Integer batteryPct,
                                                                    @RequestParam(required = false) Integer signalStrength,
                                                                    @RequestParam(required = false) String firmwareVersion,
                                                                    @RequestParam(required = false) String ipAddress) {
        return new ApiResponse<>("Health recorded",
                service.recordHealthPing(terminalId, batteryPct, signalStrength, firmwareVersion, ipAddress));
    }

    @Operation(summary = "Get terminal health")
    @GetMapping("/health/{terminalId}")
    public ApiResponse<TerminalHealthResponseDTO> getHealth(@PathVariable Long terminalId) {
        return new ApiResponse<>("Health fetched", service.getHealthByTerminal(terminalId));
    }

    @Operation(summary = "Get all terminal health records")
    @GetMapping("/health")
    public ApiResponse<List<TerminalHealthResponseDTO>> getAllHealth() {
        return new ApiResponse<>("All health fetched", service.getAllHealth());
    }

    @Operation(summary = "Get health by status")
    @GetMapping("/health/status/{status}")
    public ApiResponse<List<TerminalHealthResponseDTO>> getByStatus(@PathVariable String status) {
        return new ApiResponse<>("Health by status fetched", service.getHealthByStatus(status));
    }

    @Operation(summary = "Get stale terminals")
    @GetMapping("/health/stale")
    public ApiResponse<List<TerminalHealthResponseDTO>> getStale() {
        return new ApiResponse<>("Stale terminals fetched", service.getStaleTerminals());
    }

    @Operation(summary = "Get low battery terminals")
    @GetMapping("/health/low-battery")
    public ApiResponse<List<TerminalHealthResponseDTO>> getLowBattery() {
        return new ApiResponse<>("Low battery terminals fetched", service.getLowBatteryTerminals());
    }
}