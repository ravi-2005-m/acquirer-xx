package com.acquirerx.backend.settlement.service;

import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.service.MerchantService;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.settlement.dto.AdjustmentRequestDTO;
import com.acquirerx.backend.settlement.entity.Payout;
import com.acquirerx.backend.settlement.entity.SettlementBatch;
import com.acquirerx.backend.settlement.repository.AdjustmentRepository;
import com.acquirerx.backend.settlement.repository.PayoutRepository;
import com.acquirerx.backend.settlement.repository.SettlementBatchRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettlementServiceTest {

    @Mock
    private TxnRepository txnRepository;
    @Mock
    private SettlementBatchRepository settlementBatchRepository;
    @Mock
    private PayoutRepository payoutRepository;
    @Mock
    private AdjustmentRepository adjustmentRepository;
    @Mock
    private MerchantService merchantService;

    @InjectMocks
    private SettlementService settlementService;

    @Test
    @DisplayName("Settle creates READY batch and marks txns settled")
    void settle_shouldCreateBatch() {
        Merchant merchant = new Merchant();
        merchant.setMerchantId(1L);
        merchant.setLegalName("ABC");

        Txn t1 = new Txn();
        t1.setTxnId(10L);
        t1.setAmount(1000.0);
        t1.setTotalFee(20.0);

        Txn t2 = new Txn();
        t2.setTxnId(11L);
        t2.setAmount(500.0);
        t2.setTotalFee(10.0);

        when(merchantService.getEntityById(1L)).thenReturn(merchant);
        when(txnRepository.findByMerchantAndSettledFalse(merchant)).thenReturn(List.of(t1, t2));
        when(settlementBatchRepository.save(any(SettlementBatch.class))).thenAnswer(invocation -> {
            SettlementBatch batch = invocation.getArgument(0);
            if (batch.getSettleBatchId() == null) {
                batch.setSettleBatchId(99L);
            }
            return batch;
        });

        var response = settlementService.settle(1L);

        assertEquals(99L, response.getSettleBatchId());
        assertEquals(1500.0, response.getGrossAmount());
        assertEquals(30.0, response.getTotalFees());
        assertEquals(1470.0, response.getNetAmount());
        assertEquals("READY", response.getStatus());
        verify(txnRepository).saveAll(any());
    }

    @Test
    @DisplayName("Settle fails when no unsettled txns")
    void settle_noTxn_shouldThrow() {
        Merchant merchant = new Merchant();
        merchant.setMerchantId(1L);

        when(merchantService.getEntityById(1L)).thenReturn(merchant);
        when(txnRepository.findByMerchantAndSettledFalse(merchant)).thenReturn(List.of());

        assertThrows(IllegalStateException.class, () -> settlementService.settle(1L));
    }

    @Test
    @DisplayName("Process payout marks batch PAID")
    void processPayout_shouldSucceed() {
        Merchant merchant = new Merchant();
        merchant.setMerchantId(1L);
        merchant.setLegalName("ABC");

        SettlementBatch batch = new SettlementBatch();
        batch.setSettleBatchId(5L);
        batch.setMerchant(merchant);
        batch.setStatus("READY");
        batch.setNetAmount(900.0);

        when(settlementBatchRepository.findById(5L)).thenReturn(Optional.of(batch));
        when(payoutRepository.findBySettlementBatch_SettleBatchId(5L)).thenReturn(Optional.empty());
        when(settlementBatchRepository.save(any(SettlementBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(payoutRepository.save(any(Payout.class))).thenAnswer(invocation -> {
            Payout payout = invocation.getArgument(0);
            payout.setPayoutId(101L);
            return payout;
        });

        var response = settlementService.processPayout(5L);

        assertEquals(101L, response.getPayoutId());
        assertEquals("POSTED", response.getStatus());
        assertEquals(900.0, response.getAmount());
        assertEquals("PAID", batch.getStatus());
    }

    @Test
    @DisplayName("Create adjustment stores applied adjustment")
    void createAdjustment_shouldSave() {
        Merchant merchant = new Merchant();
        merchant.setMerchantId(1L);
        merchant.setLegalName("ABC");

        AdjustmentRequestDTO dto = new AdjustmentRequestDTO();
        dto.setMerchantId(1L);
        dto.setAmount(-50.0);
        dto.setReason("Chargeback");
        dto.setNotes("CB deduction");

        when(merchantService.getEntityById(1L)).thenReturn(merchant);
        when(adjustmentRepository.save(any())).thenAnswer(invocation -> {
            var adj = invocation.getArgument(0, com.acquirerx.backend.settlement.entity.Adjustment.class);
            adj.setAdjustmentId(88L);
            return adj;
        });

        var response = settlementService.createAdjustment(dto);

        assertEquals(88L, response.getAdjustmentId());
        assertEquals("APPLIED", response.getStatus());
        assertEquals(-50.0, response.getAmount());
    }
}
