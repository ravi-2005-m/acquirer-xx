package com.acquirerx.backend.dispute.repository;

import com.acquirerx.backend.dispute.entity.DisputeCase;
import com.acquirerx.backend.dispute.entity.DisputeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeDocumentRepository extends JpaRepository<DisputeDocument, Long> {

    List<DisputeDocument> findByDisputeCase(DisputeCase disputeCase);
}
