package com.acquirerx.transaction.fee.controller;

import com.acquirerx.transaction.common.response.ApiResponse;
import com.acquirerx.transaction.fee.dto.FeeRuleRequestDTO;
import com.acquirerx.transaction.fee.dto.FeeRuleResponseDTO;
import com.acquirerx.transaction.fee.service.FeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "5. Fee Rules")
public class FeeRuleController {

    private final FeeService service;

    @Operation(
            summary = "Create a fee rule",
            description = """
                    Creates a fee rule with optional matching criteria.
                    Rules match transactions based on MCC, Region, Amount range, and Network.

                    Matching semantics:
                    - Any null criterion matches all values
                    - MCC supports exact match ('5411') or prefix wildcard ('54*')
                    - Amount range is inclusive on both bounds
                    - Priority: lower number = higher priority (more specific rules should have lower numbers)

                    When multiple rules match, percentages are applied cumulatively by fee component.
                    """
    )
    @PostMapping("/fee-rules")
    public ApiResponse<FeeRuleResponseDTO> createFeeRule(@Valid @RequestBody FeeRuleRequestDTO dto) {
        return new ApiResponse<>("Fee rule created", service.createFeeRule(dto));
    }

    @PutMapping("/fee-rules/{feeRuleId:\\d+}")
    public ApiResponse<FeeRuleResponseDTO> updateFeeRule(@PathVariable Long feeRuleId,
                                                         @Valid @RequestBody FeeRuleRequestDTO dto) {
        return new ApiResponse<>("Fee rule updated", service.updateFeeRule(feeRuleId, dto));
    }

    @GetMapping("/fee-rules")
    public ApiResponse<List<FeeRuleResponseDTO>> getAllFeeRules() {
        return new ApiResponse<>("Fee rules fetched", service.getAllFeeRules());
    }

    @GetMapping("/fee-rules/active")
    public ApiResponse<List<FeeRuleResponseDTO>> getActiveFeeRules() {
        return new ApiResponse<>("Active fee rules fetched", service.getActiveFeeRules());
    }

    @PatchMapping("/fee-rules/{feeRuleId:\\d+}/deactivate")
    public ApiResponse<FeeRuleResponseDTO> deactivateFeeRule(@PathVariable Long feeRuleId) {
        return new ApiResponse<>("Fee rule deactivated", service.deactivateFeeRule(feeRuleId));
    }
}
