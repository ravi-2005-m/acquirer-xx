package com.acquirerx.backend.merchant.repository;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.entity.SettlementProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SettlementProfileRepository extends JpaRepository<SettlementProfile, Long> {

    List<SettlementProfile> findByMerchant(Merchant merchant);

    Optional<SettlementProfile> findByMerchantAndStatus(Merchant merchant, String status);

    List<SettlementProfile> findBySettlementCycle(String cycle);

    Long countBySettlementCycle(String cycle);
}