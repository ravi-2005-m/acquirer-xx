package com.acquirerx.merchant.merchant.service;

import com.acquirerx.merchant.common.enums.Status;
import com.acquirerx.merchant.common.exception.ResourceNotFoundException;
import com.acquirerx.merchant.merchant.dto.MerchantKYCRequestDTO;
import com.acquirerx.merchant.merchant.dto.MerchantKYCResponseDTO;
import com.acquirerx.merchant.merchant.dto.PricingModelRequestDTO;
import com.acquirerx.merchant.merchant.dto.PricingModelResponseDTO;
import com.acquirerx.merchant.merchant.dto.SettlementProfileRequestDTO;
import com.acquirerx.merchant.merchant.dto.SettlementProfileResponseDTO;
import com.acquirerx.merchant.merchant.entity.Merchant;
import com.acquirerx.merchant.merchant.entity.MerchantKYC;
import com.acquirerx.merchant.merchant.entity.PricingModel;
import com.acquirerx.merchant.merchant.entity.SettlementProfile;
import com.acquirerx.merchant.merchant.repository.MerchantKYCRepository;
import com.acquirerx.merchant.merchant.repository.PricingModelRepository;
import com.acquirerx.merchant.merchant.repository.SettlementProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantOnboardingService {

    private final MerchantService merchantService;
    private final MerchantKYCRepository kycRepository;
    private final SettlementProfileRepository settlementProfileRepository;
    private final PricingModelRepository pricingModelRepository;

    public MerchantKYCResponseDTO submitKYC(MerchantKYCRequestDTO dto) {
        Merchant merchant = merchantService.getEntityById(dto.getMerchantId());

        kycRepository.findByMerchantAndDocumentType(merchant, dto.getDocumentType())
                .ifPresent(existing -> {
                    throw new IllegalStateException(dto.getDocumentType() + " already submitted for merchant: "
                            + merchant.getLegalName());
                });

        MerchantKYC kyc = new MerchantKYC();
        kyc.setMerchant(merchant);
        kyc.setDocumentType(dto.getDocumentType());
        kyc.setDocumentRef(dto.getDocumentRef());
        kyc.setNotes(dto.getNotes());

        MerchantKYC saved = kycRepository.save(kyc);
        log.info("KYC submitted: merchantId={}, type={}, ref={}", merchant.getMerchantId(), dto.getDocumentType(), dto.getDocumentRef());

        if (merchant.getStatus() == Status.PENDING) {
            merchantService.updateStatus(merchant.getMerchantId(), Status.ACTIVE);
            log.info("Merchant activated after KYC submission: merchantId={}", merchant.getMerchantId());
        }

        return toKYCResponse(saved);
    }

    public MerchantKYCResponseDTO verifyKYC(Long kycId) {
        MerchantKYC kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC not found: " + kycId));

        if ("VERIFIED".equals(kyc.getStatus())) {
            throw new IllegalStateException("KYC already verified: " + kycId);
        }

        kyc.setStatus("VERIFIED");
        kyc.setVerifiedDate(LocalDate.now());

        MerchantKYC saved = kycRepository.save(kyc);
        log.info("KYC verified: kycId={}, merchantId={}, type={}", kycId, kyc.getMerchant().getMerchantId(), kyc.getDocumentType());
        return toKYCResponse(saved);
    }

    public MerchantKYCResponseDTO rejectKYC(Long kycId, String reason) {
        MerchantKYC kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC not found: " + kycId));

        kyc.setStatus("REJECTED");
        kyc.setNotes(reason);

        MerchantKYC saved = kycRepository.save(kyc);
        log.warn("KYC rejected: kycId={}, reason={}", kycId, reason);
        return toKYCResponse(saved);
    }

    public List<MerchantKYCResponseDTO> getKYCByMerchant(Long merchantId) {
        Merchant merchant = merchantService.getEntityById(merchantId);
        return kycRepository.findByMerchant(merchant).stream().map(this::toKYCResponse).toList();
    }

    public List<MerchantKYCResponseDTO> getPendingKYC() {
        return kycRepository.findByStatus("PENDING").stream().map(this::toKYCResponse).toList();
    }

    public SettlementProfileResponseDTO createSettlementProfile(SettlementProfileRequestDTO dto) {
        Merchant merchant = merchantService.getEntityById(dto.getMerchantId());

        settlementProfileRepository.findByMerchantAndStatus(merchant, "ACTIVE")
                .ifPresent(existing -> {
                    throw new IllegalStateException("Active settlement profile already exists for merchant: "
                            + merchant.getLegalName() + ". Deactivate existing profile first.");
                });

        SettlementProfile profile = new SettlementProfile();
        profile.setMerchant(merchant);
        profile.setSettlementCycle(dto.getSettlementCycle());
        profile.setBankAccountRef(dto.getBankAccountRef());
        profile.setReservePct(dto.getReservePct());

        SettlementProfile saved = settlementProfileRepository.save(profile);
        log.info("Settlement profile created: merchantId={}, cycle={}, reserve={}%", merchant.getMerchantId(), dto.getSettlementCycle(), dto.getReservePct());
        return toProfileResponse(saved);
    }

    public SettlementProfileResponseDTO updateSettlementProfile(Long profileId, SettlementProfileRequestDTO dto) {
        SettlementProfile profile = settlementProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement profile not found: " + profileId));

        if (dto.getSettlementCycle() != null) {
            profile.setSettlementCycle(dto.getSettlementCycle());
        }
        if (dto.getBankAccountRef() != null) {
            profile.setBankAccountRef(dto.getBankAccountRef());
        }
        if (dto.getReservePct() != null) {
            profile.setReservePct(dto.getReservePct());
        }

        SettlementProfile saved = settlementProfileRepository.save(profile);
        log.info("Settlement profile updated: profileId={}", profileId);
        return toProfileResponse(saved);
    }

    public SettlementProfileResponseDTO deactivateProfile(Long profileId) {
        SettlementProfile profile = settlementProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement profile not found: " + profileId));

        profile.setStatus("INACTIVE");
        SettlementProfile saved = settlementProfileRepository.save(profile);
        log.info("Settlement profile deactivated: profileId={}", profileId);
        return toProfileResponse(saved);
    }

    public List<SettlementProfileResponseDTO> getProfilesByMerchant(Long merchantId) {
        Merchant merchant = merchantService.getEntityById(merchantId);
        return settlementProfileRepository.findByMerchant(merchant).stream().map(this::toProfileResponse).toList();
    }

    public PricingModelResponseDTO createPricingModel(PricingModelRequestDTO dto) {
        Merchant merchant = merchantService.getEntityById(dto.getMerchantId());

        pricingModelRepository.findByMerchantAndStatus(merchant, "ACTIVE")
                .ifPresent(existing -> {
                    throw new IllegalStateException("Active pricing model already exists for merchant: "
                            + merchant.getLegalName() + ". Deactivate existing model first.");
                });

        PricingModel model = new PricingModel();
        model.setMerchant(merchant);
        model.setModelType(dto.getModelType());
        model.setMdrPct(dto.getMdrPct());
        java.math.BigDecimal perTxnFee = dto.getPerTxnFee();
        if (perTxnFee == null) {
            perTxnFee = java.math.BigDecimal.ZERO;
        }
        model.setPerTxnFee(perTxnFee);
        model.setSchemeFeePassThrough(dto.getSchemeFeePassThrough() != null ? dto.getSchemeFeePassThrough() : "NO");
        model.setEffectiveFrom(dto.getEffectiveFrom());
        model.setEffectiveTo(dto.getEffectiveTo());

        PricingModel saved = pricingModelRepository.save(model);
        log.info("Pricing model created: merchantId={}, type={}, mdr={}%", merchant.getMerchantId(), dto.getModelType(), dto.getMdrPct());
        return toPricingResponse(saved);
    }

    public PricingModelResponseDTO deactivatePricing(Long pricingId) {
        PricingModel model = pricingModelRepository.findById(pricingId)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing model not found: " + pricingId));

        model.setStatus("INACTIVE");
        PricingModel saved = pricingModelRepository.save(model);
        log.info("Pricing model deactivated: pricingId={}", pricingId);
        return toPricingResponse(saved);
    }

    public List<PricingModelResponseDTO> getPricingByMerchant(Long merchantId) {
        Merchant merchant = merchantService.getEntityById(merchantId);
        return pricingModelRepository.findByMerchant(merchant).stream().map(this::toPricingResponse).toList();
    }

    public List<PricingModelResponseDTO> getActivePricingModels() {
        return pricingModelRepository.findByStatus("ACTIVE").stream().map(this::toPricingResponse).toList();
    }

    private MerchantKYCResponseDTO toKYCResponse(MerchantKYC kyc) {
        MerchantKYCResponseDTO response = new MerchantKYCResponseDTO();
        response.setKycId(kyc.getKycId());
        response.setMerchantId(kyc.getMerchant().getMerchantId());
        response.setMerchantName(kyc.getMerchant().getLegalName());
        response.setDocumentType(kyc.getDocumentType());
        response.setDocumentRef(kyc.getDocumentRef());
        response.setVerifiedDate(kyc.getVerifiedDate());
        response.setStatus(kyc.getStatus());
        response.setNotes(kyc.getNotes());
        response.setSubmittedAt(kyc.getSubmittedAt());
        return response;
    }

    private SettlementProfileResponseDTO toProfileResponse(SettlementProfile profile) {
        SettlementProfileResponseDTO response = new SettlementProfileResponseDTO();
        response.setSettleProfileId(profile.getSettleProfileId());
        response.setMerchantId(profile.getMerchant().getMerchantId());
        response.setMerchantName(profile.getMerchant().getLegalName());
        response.setSettlementCycle(profile.getSettlementCycle());
        response.setBankAccountRef(profile.getBankAccountRef());
        response.setReservePct(profile.getReservePct());
        response.setStatus(profile.getStatus());
        response.setCreatedAt(profile.getCreatedAt());
        response.setUpdatedAt(profile.getUpdatedAt());
        return response;
    }

    private PricingModelResponseDTO toPricingResponse(PricingModel model) {
        PricingModelResponseDTO response = new PricingModelResponseDTO();
        response.setPricingId(model.getPricingId());
        response.setMerchantId(model.getMerchant().getMerchantId());
        response.setMerchantName(model.getMerchant().getLegalName());
        response.setModelType(model.getModelType());
        response.setMdrPct(model.getMdrPct());
        response.setPerTxnFee(model.getPerTxnFee());
        response.setSchemeFeePassThrough(model.getSchemeFeePassThrough());
        response.setEffectiveFrom(model.getEffectiveFrom());
        response.setEffectiveTo(model.getEffectiveTo());
        response.setStatus(model.getStatus());
        response.setCreatedAt(model.getCreatedAt());
        return response;
    }
}
