package com.acquirerx.transaction.fee.repository;

import com.acquirerx.transaction.fee.entity.FeeRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRuleRepository extends JpaRepository<FeeRule, Long> {

    List<FeeRule> findByStatus(String status);

    List<FeeRule> findByStatusOrderByPriorityAsc(String status);

    boolean existsByCardTypeAndTransactionType(String cardType, String transactionType);
}
