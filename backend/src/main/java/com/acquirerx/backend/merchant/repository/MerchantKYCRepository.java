package com.acquirerx.backend.merchant.repository;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.entity.MerchantKYC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MerchantKYCRepository extends JpaRepository<MerchantKYC, Long> {

    List<MerchantKYC> findByMerchant(Merchant merchant);

    Page<MerchantKYC> findByMerchant(Merchant merchant, Pageable pageable);

    List<MerchantKYC> findByStatus(String status);

    Optional<MerchantKYC> findByMerchantAndDocumentType(Merchant merchant, String documentType);

    Long countByStatus(String status);

    Long countByMerchantAndStatus(Merchant merchant, String status);
}