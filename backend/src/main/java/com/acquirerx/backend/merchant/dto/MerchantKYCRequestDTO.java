package com.acquirerx.backend.merchant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class MerchantKYCRequestDTO {

    @NotNull(message = "Merchant ID is required")
    private Long merchantId;

    @NotBlank(message = "Document type is required")
    @Pattern(regexp = "^(PAN_CARD|GST_CERT|BANK_PROOF|INCORPORATION_CERT|ADDRESS_PROOF|IDENTITY_PROOF)$",
            message = "Document type must be PAN_CARD, GST_CERT, BANK_PROOF, INCORPORATION_CERT, ADDRESS_PROOF, or IDENTITY_PROOF")
    private String documentType;

    @NotBlank(message = "Document reference is required")
    private String documentRef;

    private String notes;

    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getDocumentRef() {
        return documentRef;
    }

    public void setDocumentRef(String documentRef) {
        this.documentRef = documentRef;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}