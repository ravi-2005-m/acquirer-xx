package com.acquirerx.backend.reconciliation.service;

import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.reconciliation.dto.ReconFileRequestDTO;
import com.acquirerx.backend.reconciliation.dto.ReconItemInputDTO;
import com.acquirerx.backend.reconciliation.entity.ExceptionCase;
import com.acquirerx.backend.reconciliation.entity.ReconFile;
import com.acquirerx.backend.reconciliation.entity.ReconItem;
import com.acquirerx.backend.reconciliation.repository.ExceptionCaseRepository;
import com.acquirerx.backend.reconciliation.repository.ReconFileRepository;
import com.acquirerx.backend.reconciliation.repository.ReconItemRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReconciliationServiceTest {

    @Mock
    private ReconFileRepository reconFileRepository;
    @Mock
    private ReconItemRepository reconItemRepository;
    @Mock
    private ExceptionCaseRepository exceptionCaseRepository;
    @Mock
    private TxnRepository txnRepository;

    @InjectMocks
    private ReconciliationService reconciliationService;

    @Test
    @DisplayName("loadAndReconcile handles matched mismatched unmatched")
    void loadAndReconcile_mix_shouldProcessAll() {
        Txn txn1 = new Txn();
        txn1.setTxnId(1L);
        txn1.setAmount(100.0);

        Txn txn2 = new Txn();
        txn2.setTxnId(2L);
        txn2.setAmount(200.0);

        ReconItemInputDTO i1 = new ReconItemInputDTO();
        i1.setReference("1");
        i1.setAmount(100.0);

        ReconItemInputDTO i2 = new ReconItemInputDTO();
        i2.setReference("2");
        i2.setAmount(250.0);

        ReconItemInputDTO i3 = new ReconItemInputDTO();
        i3.setReference("999");
        i3.setAmount(50.0);

        ReconFileRequestDTO dto = new ReconFileRequestDTO();
        dto.setSource("SWITCH");
        dto.setFileDate(LocalDate.now());
        dto.setItems(List.of(i1, i2, i3));

        when(txnRepository.findAll()).thenReturn(List.of(txn1, txn2));
        when(reconFileRepository.save(any(ReconFile.class))).thenAnswer(invocation -> {
            ReconFile file = invocation.getArgument(0);
            if (file.getReconFileId() == null) {
                file.setReconFileId(77L);
            }
            return file;
        });
        when(reconItemRepository.save(any(ReconItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(exceptionCaseRepository.save(any(ExceptionCase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = reconciliationService.loadAndReconcile(dto);

        assertEquals(77L, response.getReconFileId());
        assertEquals("PROCESSED", response.getStatus());
        assertEquals(3, response.getRowCount());
        verify(reconItemRepository, times(3)).save(any(ReconItem.class));
        verify(exceptionCaseRepository, times(2)).save(any(ExceptionCase.class));
    }
}
