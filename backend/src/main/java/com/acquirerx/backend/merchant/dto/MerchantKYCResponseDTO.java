package com.acquirerx.backend.merchant.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MerchantKYCResponseDTO {

    private Long kycId;
    private Long merchantId;
    private String merchantName;
    private String documentType;
    private String documentRef;
    private LocalDate verifiedDate;
    private String status;
    private String notes;
    private LocalDateTime submittedAt;

    public Long getKycId() { return kycId; }
    public void setKycId(Long kycId) { this.kycId = kycId; }
    public Long getMerchantId() { return merchantId; }
    public void setMerchantId(Long merchantId) { this.merchantId = merchantId; }
    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String documentRef) { this.documentRef = documentRef; }
    public LocalDate getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(LocalDate verifiedDate) { this.verifiedDate = verifiedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}