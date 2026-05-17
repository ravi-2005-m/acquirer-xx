package com.acquirerx.risk.risk.controller;

import com.acquirerx.risk.common.dto.PagedResponseDTO;
import com.acquirerx.risk.common.pagination.PaginationParams;
import com.acquirerx.risk.common.response.ApiResponse;
import com.acquirerx.risk.risk.dto.BlacklistRequestDTO;
import com.acquirerx.risk.risk.dto.BlacklistResponseDTO;
import com.acquirerx.risk.risk.dto.RiskCheckResultDTO;
import com.acquirerx.risk.risk.dto.RiskEventFilterDTO;
import com.acquirerx.risk.risk.dto.RiskEventResponseDTO;
import com.acquirerx.risk.risk.dto.RiskRuleRequestDTO;
import com.acquirerx.risk.risk.dto.RiskRuleResponseDTO;
import com.acquirerx.risk.risk.dto.RiskSummaryDTO;
import com.acquirerx.risk.risk.service.RiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
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
@Validated
public class RiskController {

    private final RiskService service;

    @PostMapping("/rules")
    public ApiResponse<RiskRuleResponseDTO> createRule(@Valid @RequestBody RiskRuleRequestDTO dto) {
        return new ApiResponse<>("Risk rule created", service.createRule(dto));
    }

    @GetMapping("/rules")
    public ApiResponse<PagedResponseDTO<RiskRuleResponseDTO>> getActiveRules(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Rules fetched", service.getActiveRules(pagination));
    }

    @PatchMapping("/rules/{id:\\d+}/deactivate")
    public ApiResponse<RiskRuleResponseDTO> deactivateRule(@PathVariable Long id) {
        return new ApiResponse<>("Rule deactivated", service.deactivateRule(id));
    }

    @PostMapping("/blacklist")
    public ApiResponse<BlacklistResponseDTO> addToBlacklist(@Valid @RequestBody BlacklistRequestDTO dto) {
        return new ApiResponse<>("Added to blacklist", service.addToBlacklist(dto));
    }

    @DeleteMapping("/blacklist/{id:\\d+}")
    public ApiResponse<BlacklistResponseDTO> removeFromBlacklist(@PathVariable Long id) {
        return new ApiResponse<>("Removed from blacklist", service.removeFromBlacklist(id));
    }

    @GetMapping("/blacklist")
    public ApiResponse<PagedResponseDTO<BlacklistResponseDTO>> getBlacklist(
            @RequestParam(required = false) String type,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Blacklist fetched", service.getActiveBlacklist(type, pagination));
    }

    @GetMapping("/events")
    public ApiResponse<PagedResponseDTO<RiskEventResponseDTO>> getAllEvents(@Valid PaginationParams pagination) {
        return new ApiResponse<>("Risk events fetched", service.getAllRiskEvents(pagination));
    }

    @PostMapping("/events/search")
    public ApiResponse<PagedResponseDTO<RiskEventResponseDTO>> searchEvents(
            @Valid @RequestBody RiskEventFilterDTO filter,
            @Valid PaginationParams pagination) {
        return new ApiResponse<>("Risk events fetched", service.searchRiskEvents(filter, pagination));
    }

    @Operation(
            summary = "Manual risk check",
            description = "Checks blacklist (terminal + PAN) and evaluates active risk rules. Returns ALLOW, REVIEW, or BLOCK with score and reason."
    )
    @PostMapping("/check")
    public ApiResponse<RiskCheckResultDTO> checkRisk(
            @RequestParam @DecimalMin(value = "0.01", message = "Amount must be > 0") Double amount,
            @RequestParam(required = false)
            @Pattern(regexp = "^[0-9]{6}[*X]{3,9}[0-9]{4}$", message = "PAN must be masked")
            String panMasked,
            @RequestParam(required = false) String tid,
            HttpServletRequest request) {
        Long userId = parseUserId(request.getHeader("X-User-Id"));
        RiskCheckResultDTO result = service.checkRisk(amount, panMasked, tid);
        service.saveManualCheckEvent(panMasked, result, userId, amount);
        return new ApiResponse<>("Risk check complete", result);
    }

    private Long parseUserId(String header) {
        if (header == null || header.isBlank()) return null;
        try { return Long.parseLong(header); } catch (NumberFormatException e) { return null; }
    }

    @GetMapping("/summary")
    public ApiResponse<RiskSummaryDTO> getSummary() {
        return new ApiResponse<>("Risk summary fetched", service.getRiskSummary());
    }
}
