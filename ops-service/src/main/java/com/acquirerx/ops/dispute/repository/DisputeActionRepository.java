package com.acquirerx.ops.dispute.repository;

import com.acquirerx.ops.dispute.entity.DisputeAction;
import com.acquirerx.ops.dispute.entity.DisputeCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeActionRepository extends JpaRepository<DisputeAction, Long> {

    List<DisputeAction> findByDisputeCase(DisputeCase disputeCase);

    List<DisputeAction> findByDisputeCaseOrderByActionDateAsc(DisputeCase disputeCase);
}


