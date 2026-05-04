package com.acquirerx.merchant.merchant.controller;

import com.acquirerx.merchant.common.response.ApiResponse;
import com.acquirerx.merchant.merchant.dto.MerchantKYCRequestDTO;
import com.acquirerx.merchant.merchant.dto.MerchantKYCResponseDTO;
import com.acquirerx.merchant.merchant.dto.PricingModelRequestDTO;
import com.acquirerx.merchant.merchant.dto.PricingModelResponseDTO;
import com.acquirerx.merchant.merchant.dto.SettlementProfileRequestDTO;
import com.acquirerx.merchant.merchant.dto.SettlementProfileResponseDTO;
import com.acquirerx.merchant.merchant.service.MerchantOnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/merchants/onboarding")
@RequiredArgsConstructor
@Tag(name = "2. Merchants")
public class MerchantOnboardingController {

    private final MerchantOnboardingService service;

    @Operation(summary = "Submit KYC document")
    @PostMapping("/kyc")
    public ApiResponse<MerchantKYCResponseDTO> submitKYC(@Valid @RequestBody MerchantKYCRequestDTO dto) {
        return new ApiResponse<>("KYC submitted", service.submitKYC(dto));
    }

    @Operation(summary = "Verify KYC document")
    @PatchMapping("/kyc/{kycId:\\d+}/verify")
    public ApiResponse<MerchantKYCResponseDTO> verifyKYC(@PathVariable Long kycId) {
        return new ApiResponse<>("KYC verified", service.verifyKYC(kycId));
    }

    @Operation(summary = "Reject KYC document")
    @PatchMapping("/kyc/{kycId:\\d+}/reject")
    public ApiResponse<MerchantKYCResponseDTO> rejectKYC(@PathVariable Long kycId,
                                                         @RequestParam String reason) {
        return new ApiResponse<>("KYC rejected", service.rejectKYC(kycId, reason));
    }

    @Operation(summary = "Get KYC documents for a merchant")
    @GetMapping("/kyc/merchant/{merchantId:\\d+}")
    public ApiResponse<List<MerchantKYCResponseDTO>> getKYCByMerchant(@PathVariable Long merchantId) {
        return new ApiResponse<>("KYC documents fetched", service.getKYCByMerchant(merchantId));
    }

    @Operation(summary = "Get all pending KYC documents")
    @GetMapping("/kyc/pending")
    public ApiResponse<List<MerchantKYCResponseDTO>> getPendingKYC() {
        return new ApiResponse<>("Pending KYC fetched", service.getPendingKYC());
    }

    @Operation(summary = "Create settlement profile")
    @PostMapping("/settlement-profile")
    public ApiResponse<SettlementProfileResponseDTO> createProfile(@Valid @RequestBody SettlementProfileRequestDTO dto) {
        return new ApiResponse<>("Settlement profile created", service.createSettlementProfile(dto));
    }

    @Operation(summary = "Update settlement profile")
    @PutMapping("/settlement-profile/{profileId:\\d+}")
    public ApiResponse<SettlementProfileResponseDTO> updateProfile(@PathVariable Long profileId,
                                                                   @RequestBody SettlementProfileRequestDTO dto) {
        return new ApiResponse<>("Settlement profile updated", service.updateSettlementProfile(profileId, dto));
    }

    @Operation(summary = "Deactivate settlement profile")
    @PatchMapping("/settlement-profile/{profileId:\\d+}/deactivate")
    public ApiResponse<SettlementProfileResponseDTO> deactivateProfile(@PathVariable Long profileId) {
        return new ApiResponse<>("Settlement profile deactivated", service.deactivateProfile(profileId));
    }

    @Operation(summary = "Get settlement profiles for a merchant")
    @GetMapping("/settlement-profile/merchant/{merchantId:\\d+}")
    public ApiResponse<List<SettlementProfileResponseDTO>> getProfiles(@PathVariable Long merchantId) {
        return new ApiResponse<>("Settlement profiles fetched", service.getProfilesByMerchant(merchantId));
    }

    @Operation(summary = "Create pricing model")
    @PostMapping("/pricing")
    public ApiResponse<PricingModelResponseDTO> createPricing(@Valid @RequestBody PricingModelRequestDTO dto) {
        return new ApiResponse<>("Pricing model created", service.createPricingModel(dto));
    }

    @Operation(summary = "Deactivate pricing model")
    @PatchMapping("/pricing/{pricingId:\\d+}/deactivate")
    public ApiResponse<PricingModelResponseDTO> deactivatePricing(@PathVariable Long pricingId) {
        return new ApiResponse<>("Pricing model deactivated", service.deactivatePricing(pricingId));
    }

    @Operation(summary = "Get pricing models for a merchant")
    @GetMapping("/pricing/merchant/{merchantId:\\d+}")
    public ApiResponse<List<PricingModelResponseDTO>> getPricing(@PathVariable Long merchantId) {
        return new ApiResponse<>("Pricing models fetched", service.getPricingByMerchant(merchantId));
    }

    @Operation(summary = "Get all active pricing models")
    @GetMapping("/pricing/active")
    public ApiResponse<List<PricingModelResponseDTO>> getActivePricing() {
        return new ApiResponse<>("Active pricing models fetched", service.getActivePricingModels());
    }
}
