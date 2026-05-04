package com.acquirerx.merchant.merchant.repository;

import com.acquirerx.merchant.merchant.entity.Merchant;
import com.acquirerx.merchant.merchant.entity.PricingModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PricingModelRepository extends JpaRepository<PricingModel, Long> {

    List<PricingModel> findByMerchant(Merchant merchant);

    Optional<PricingModel> findByMerchantAndStatus(Merchant merchant, String status);

    List<PricingModel> findByModelType(String modelType);

    List<PricingModel> findByStatus(String status);

    Long countByModelType(String modelType);
}
