package com.acquirerx.backend.dispute.service;

import com.acquirerx.backend.common.enums.DisputeStage;
import com.acquirerx.backend.common.enums.DisputeStatus;
import com.acquirerx.backend.dispute.dto.OpenDisputeRequestDTO;
import com.acquirerx.backend.dispute.entity.DisputeCase;
import com.acquirerx.backend.dispute.repository.DisputeActionRepository;
import com.acquirerx.backend.dispute.repository.DisputeCaseRepository;
import com.acquirerx.backend.dispute.repository.DisputeDocumentRepository;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock
    private DisputeCaseRepository disputeCaseRepository;
    @Mock
    private DisputeDocumentRepository disputeDocumentRepository;
    @Mock
    private DisputeActionRepository disputeActionRepository;
    @Mock
    private TxnRepository txnRepository;

    @InjectMocks
    private DisputeService disputeService;

    @Test
    @DisplayName("Open dispute creates RETRIEVAL OPEN case")
    void openDispute_shouldCreate() {
        Txn txn = new Txn();
        txn.setTxnId(1L);
        txn.setAmount(1000.0);

        OpenDisputeRequestDTO dto = new OpenDisputeRequestDTO();
        dto.setTxnId(1L);
        dto.setReasonCode("FRAUD");

        when(txnRepository.findById(1L)).thenReturn(Optional.of(txn));
        when(disputeCaseRepository.findByTxnAndStatus(txn, DisputeStatus.OPEN)).thenReturn(Optional.empty());
        when(disputeCaseRepository.save(any(DisputeCase.class))).thenAnswer(invocation -> {
            DisputeCase disputeCase = invocation.getArgument(0);
            disputeCase.setCaseId(10L);
            return disputeCase;
        });

        var result = disputeService.openDispute(dto);

        assertEquals(10L, result.getCaseId());
        assertEquals("RETRIEVAL", result.getStage());
        assertEquals("OPEN", result.getStatus());
    }

    @Test
    @DisplayName("Advance stage moves RETRIEVAL to CHARGEBACK")
    void advanceStage_shouldMoveNext() {
        DisputeCase disputeCase = new DisputeCase();
        disputeCase.setCaseId(20L);
        disputeCase.setStatus(DisputeStatus.OPEN);
        disputeCase.setStage(DisputeStage.RETRIEVAL);

        when(disputeCaseRepository.findById(20L)).thenReturn(Optional.of(disputeCase));
        when(disputeCaseRepository.save(any(DisputeCase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = disputeService.advanceStage(20L);

        assertEquals("CHARGEBACK", result.getStage());
    }

    @Test
    @DisplayName("Close dispute sets CLOSED status")
    void closeDispute_shouldClose() {
        DisputeCase disputeCase = new DisputeCase();
        disputeCase.setCaseId(30L);
        disputeCase.setStatus(DisputeStatus.OPEN);
        disputeCase.setStage(DisputeStage.CHARGEBACK);

        when(disputeCaseRepository.findById(30L)).thenReturn(Optional.of(disputeCase));
        when(disputeCaseRepository.save(any(DisputeCase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = disputeService.closeDispute(30L);

        assertEquals("CLOSED", result.getStatus());
    }
}
