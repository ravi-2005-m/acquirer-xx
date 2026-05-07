package com.acquirerx.terminal.terminal.service;

import com.acquirerx.terminal.common.exception.ResourceNotFoundException;
import com.acquirerx.terminal.terminal.dto.ParamProfileRequestDTO;
import com.acquirerx.terminal.terminal.dto.ParamProfileResponseDTO;
import com.acquirerx.terminal.terminal.dto.TerminalHealthResponseDTO;
import com.acquirerx.terminal.terminal.entity.ParamProfile;
import com.acquirerx.terminal.terminal.entity.Terminal;
import com.acquirerx.terminal.terminal.entity.TerminalHealth;
import com.acquirerx.terminal.terminal.repository.ParamProfileRepository;
import com.acquirerx.terminal.terminal.repository.TerminalHealthRepository;
import com.acquirerx.terminal.terminal.repository.TerminalRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerminalProvisioningService {

    private final TerminalService terminalService;
    private final TerminalRepository terminalRepository;
    private final ParamProfileRepository paramProfileRepository;
    private final TerminalHealthRepository healthRepository;
    private static final ObjectMapper JSON = new ObjectMapper();

    private void validateParamsJson(String paramsJson) {
        if (paramsJson == null || paramsJson.isBlank()) return;
        try {
            JSON.readTree(paramsJson);
        } catch (Exception e) {
            throw new IllegalArgumentException("Parameters JSON is not valid JSON.");
        }
    }

    public ParamProfileResponseDTO createProfile(ParamProfileRequestDTO dto) {
        validateParamsJson(dto.getParamsJson());
        if (paramProfileRepository.existsByName(dto.getName())) {
            throw new IllegalStateException("Profile with this name already exists: " + dto.getName());
        }

        ParamProfile profile = new ParamProfile();
        profile.setName(dto.getName());
        profile.setParamsJson(dto.getParamsJson());

        ParamProfile saved = paramProfileRepository.save(profile);
        log.info("Param profile created: id={}, name={}", saved.getParamProfileId(), saved.getName());
        return toProfileResponse(saved);
    }

    public ParamProfileResponseDTO updateProfile(Long profileId, ParamProfileRequestDTO dto) {
        validateParamsJson(dto.getParamsJson());
        ParamProfile profile = paramProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Param profile not found: " + profileId));

        profile.setName(dto.getName());
        profile.setParamsJson(dto.getParamsJson());
        Integer version = profile.getVersion();
        profile.setVersion(version == null ? 1 : version + 1);

        ParamProfile saved = paramProfileRepository.save(profile);
        log.info("Param profile updated: id={}, version={}", profileId, saved.getVersion());
        return toProfileResponse(saved);
    }

    public ParamProfileResponseDTO deactivateProfile(Long profileId) {
        ParamProfile profile = paramProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Param profile not found: " + profileId));

        profile.setStatus("INACTIVE");
        ParamProfile saved = paramProfileRepository.save(profile);
        log.info("Param profile deactivated: id={}", profileId);
        return toProfileResponse(saved);
    }

    public List<ParamProfileResponseDTO> getAllActiveProfiles() {
        return paramProfileRepository.findByStatus("ACTIVE").stream().map(this::toProfileResponse).toList();
    }

    public List<ParamProfileResponseDTO> getAllProfiles() {
        return paramProfileRepository.findAll().stream().map(this::toProfileResponse).toList();
    }

    public String assignProfileToTerminal(Long terminalId, Long profileId) {
        Terminal terminal = terminalService.getEntityById(terminalId);
        ParamProfile profile = paramProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Param profile not found: " + profileId));

        if (!"ACTIVE".equals(profile.getStatus())) {
            throw new IllegalStateException("Cannot assign inactive profile: " + profileId);
        }

        terminal.setParamProfile(profile);
        terminalRepository.save(terminal);

        log.info("Profile {} assigned to terminal {}", profileId, terminal.getTid());
        return "Profile '" + profile.getName() + "' assigned to terminal " + terminal.getTid();
    }

    public TerminalHealthResponseDTO recordHealthPing(Long terminalId, Integer batteryPct, Integer signalStrength,
                                                      String firmwareVersion, String ipAddress) {
        Terminal terminal = terminalService.getEntityById(terminalId);

        TerminalHealth health = healthRepository.findByTerminal(terminal)
                .orElseGet(() -> {
                    TerminalHealth newHealth = new TerminalHealth();
                    newHealth.setTerminal(terminal);
                    return newHealth;
                });

        health.setLastSeen(LocalDateTime.now());
        health.setBatteryPct(batteryPct);
        health.setSignalStrength(signalStrength);
        health.setFirmwareVersion(firmwareVersion);
        health.setIpAddress(ipAddress);
        health.setStatus(determineStatus(batteryPct, signalStrength));

        TerminalHealth saved = healthRepository.save(health);
        log.info("Health ping: terminal={}, status={}, battery={}%, signal={}%",
                terminal.getTid(), saved.getStatus(), batteryPct, signalStrength);
        return toHealthResponse(saved);
    }

    public TerminalHealthResponseDTO getHealthByTerminal(Long terminalId) {
        Terminal terminal = terminalService.getEntityById(terminalId);
        TerminalHealth health = healthRepository.findByTerminal(terminal)
                .orElseThrow(() -> new ResourceNotFoundException("No health record for terminal: " + terminal.getTid()));
        return toHealthResponse(health);
    }

    public List<TerminalHealthResponseDTO> getAllHealth() {
        return healthRepository.findAll().stream().map(this::toHealthResponse).toList();
    }

    public List<TerminalHealthResponseDTO> getHealthByStatus(String status) {
        return healthRepository.findByStatus(status).stream().map(this::toHealthResponse).toList();
    }

    public List<TerminalHealthResponseDTO> getStaleTerminals() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        return healthRepository.findStaleTerminals(threshold).stream().map(this::toHealthResponse).toList();
    }

    public List<TerminalHealthResponseDTO> getLowBatteryTerminals() {
        return healthRepository.findLowBattery(20).stream().map(this::toHealthResponse).toList();
    }

    private String determineStatus(Integer batteryPct, Integer signalStrength) {
        if (batteryPct != null && batteryPct < 20) {
            return "DEGRADED";
        }
        if (signalStrength != null && signalStrength < 20) {
            return "DEGRADED";
        }
        return "ONLINE";
    }

    private ParamProfileResponseDTO toProfileResponse(ParamProfile profile) {
        ParamProfileResponseDTO response = new ParamProfileResponseDTO();
        response.setParamProfileId(profile.getParamProfileId());
        response.setName(profile.getName());
        response.setParamsJson(profile.getParamsJson());
        response.setVersion(profile.getVersion());
        response.setStatus(profile.getStatus());
        response.setCreatedAt(profile.getCreatedAt());
        response.setUpdatedAt(profile.getUpdatedAt());
        return response;
    }

    private TerminalHealthResponseDTO toHealthResponse(TerminalHealth health) {
        TerminalHealthResponseDTO response = new TerminalHealthResponseDTO();
        response.setHealthId(health.getHealthId());
        response.setTerminalId(health.getTerminal().getTerminalId());
        response.setTid(health.getTerminal().getTid());
        // Store and merchant names are not directly available; would need Feign client to lookup
        // For now, leaving storeName and merchantName as null
        response.setLastSeen(health.getLastSeen());
        response.setBatteryPct(health.getBatteryPct());
        response.setSignalStrength(health.getSignalStrength());
        response.setStatus(health.getStatus());
        response.setFirmwareVersion(health.getFirmwareVersion());
        response.setIpAddress(health.getIpAddress());
        response.setUpdatedAt(health.getUpdatedAt());
        return response;
    }
}
