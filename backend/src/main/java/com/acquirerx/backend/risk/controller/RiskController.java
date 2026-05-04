package com.acquirerx.backend.risk.controller;

import com.acquirerx.backend.common.dto.PagedResponseDTO;
import com.acquirerx.backend.common.response.ApiResponse;
import com.acquirerx.backend.risk.dto.BlacklistRequestDTO;
import com.acquirerx.backend.risk.dto.BlacklistResponseDTO;
import com.acquirerx.backend.risk.dto.RiskCheckResultDTO;
import com.acquirerx.backend.risk.dto.RiskEventFilterDTO;
import com.acquirerx.backend.risk.dto.RiskEventResponseDTO;
import com.acquirerx.backend.risk.dto.RiskRuleRequestDTO;
import com.acquirerx.backend.risk.dto.RiskRuleResponseDTO;
import com.acquirerx.backend.risk.dto.RiskSummaryDTO;
import com.acquirerx.backend.risk.service.RiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/risk")
@RequiredArgsConstructor
@Tag(name = "8. Risk & Fraud")
public class RiskController {

    private final RiskService service;

    @PostMapping("/rules")
    public ApiResponse<RiskRuleResponseDTO> createRule(@Valid @RequestBody RiskRuleRequestDTO dto) {
        return new ApiResponse<>("Risk rule created", service.createRule(dto));
    }

    @GetMapping("/rules")
    public ApiResponse<PagedResponseDTO<RiskRuleResponseDTO>> getActiveRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Rules fetched", service.getActiveRules(page, size));
    }

    @PatchMapping("/rules/{id}/deactivate")
    public ApiResponse<RiskRuleResponseDTO> deactivateRule(@PathVariable Long id) {
        return new ApiResponse<>("Rule deactivated", service.deactivateRule(id));
    }

    @PostMapping("/blacklist")
    public ApiResponse<BlacklistResponseDTO> addToBlacklist(@Valid @RequestBody BlacklistRequestDTO dto) {
        return new ApiResponse<>("Added to blacklist", service.addToBlacklist(dto));
    }

    @DeleteMapping("/blacklist/{id}")
    public ApiResponse<BlacklistResponseDTO> removeFromBlacklist(@PathVariable Long id) {
        return new ApiResponse<>("Removed from blacklist", service.removeFromBlacklist(id));
    }

    @GetMapping("/blacklist")
    public ApiResponse<PagedResponseDTO<BlacklistResponseDTO>> getBlacklist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type) {
        return new ApiResponse<>("Blacklist fetched", service.getActiveBlacklist(type, page, size));
    }

    @GetMapping("/events")
    public ApiResponse<PagedResponseDTO<RiskEventResponseDTO>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Risk events fetched", service.getAllRiskEvents(page, size));
    }

    @PostMapping("/events/search")
    public ApiResponse<PagedResponseDTO<RiskEventResponseDTO>> searchEvents(
            @Valid @RequestBody RiskEventFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new ApiResponse<>("Risk events fetched", service.searchRiskEvents(filter, page, size));
    }

        @Operation(
            summary = "Manual risk check",
            description = "Checks blacklist (terminal + PAN) and evaluates active risk rules. Returns ALLOW, REVIEW, or BLOCK with score and reason."
        )
    @PostMapping("/check")
    public ApiResponse<RiskCheckResultDTO> checkRisk(@RequestParam Double amount,
                                                     @RequestParam(required = false) String panMasked,
                                                     @RequestParam(required = false) String tid) {
        return new ApiResponse<>("Risk check complete", service.checkRisk(amount, panMasked, tid));
    }

    @GetMapping("/summary")
    public ApiResponse<RiskSummaryDTO> getSummary() {
        return new ApiResponse<>("Risk summary fetched", service.getRiskSummary());
    }
}
