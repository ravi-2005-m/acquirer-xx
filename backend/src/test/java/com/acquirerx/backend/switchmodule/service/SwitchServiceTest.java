package com.acquirerx.backend.switchmodule.service;

import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.risk.dto.RiskCheckResultDTO;
import com.acquirerx.backend.risk.service.RiskService;
import com.acquirerx.backend.store.entity.Store;
import com.acquirerx.backend.switchmodule.dto.AuthResponseDTO;
import com.acquirerx.backend.switchmodule.dto.AuthorizeRequestDTO;
import com.acquirerx.backend.switchmodule.dto.RefundRequestDTO;
import com.acquirerx.backend.switchmodule.dto.VoidRequestDTO;
import com.acquirerx.backend.switchmodule.entity.AuthMessage;
import com.acquirerx.backend.switchmodule.entity.Batch;
import com.acquirerx.backend.switchmodule.enums.BatchStatus;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import com.acquirerx.backend.switchmodule.repository.AuthMessageRepository;
import com.acquirerx.backend.switchmodule.repository.BatchRepository;
import com.acquirerx.backend.terminal.entity.Terminal;
import com.acquirerx.backend.terminal.service.TerminalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SwitchServiceTest {

    @Mock
    private AuthMessageRepository authRepo;
    @Mock
    private BatchRepository batchRepo;
    @Mock
    private TerminalService terminalService;
    @Mock
    private RiskService riskService;
    @Mock
    private TxnRepository txnRepository;

    @InjectMocks
    private SwitchService switchService;

    private Terminal terminal;
    private Batch openBatch;

    @BeforeEach
    void setUp() {
        Merchant merchant = new Merchant();
        merchant.setMerchantId(1L);
        merchant.setLegalName("ABC Supermarket");
        merchant.setStatus(Status.ACTIVE);

        Store store = new Store();
        store.setStoreId(1L);
        store.setStoreName("ABC Chennai");
        store.setMerchant(merchant);

        terminal = new Terminal();
        terminal.setTerminalId(1L);
        terminal.setTid("TID-001");
        terminal.setStore(store);

        openBatch = new Batch();
        openBatch.setBatchId(1L);
        openBatch.setTerminal(terminal);
        openBatch.setStatus(BatchStatus.OPEN);
    }

    @Test
    @DisplayName("Authorize approves ALLOW risk")
    void authorize_allow_shouldApprove() {
        AuthorizeRequestDTO dto = new AuthorizeRequestDTO();
        dto.setTerminalId(1L);
        dto.setAmount(1000.0);
        dto.setCurrency("INR");

        when(terminalService.getEntityById(1L)).thenReturn(terminal);
        when(batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)).thenReturn(Optional.of(openBatch));
        when(riskService.checkRisk(1000.0, null, "TID-001"))
                .thenReturn(new RiskCheckResultDTO("ALLOW", 0, "All checks passed"));
        when(authRepo.save(any(AuthMessage.class))).thenAnswer(invocation -> {
            AuthMessage auth = invocation.getArgument(0);
            auth.setAuthId(10L);
            return auth;
        });

        AuthResponseDTO result = switchService.authorize(dto);

        assertEquals("APPROVED", result.getStatus());
        assertEquals("00", result.getResponseCode());
        assertNotNull(result.getAuthCode());
        verify(authRepo).save(any(AuthMessage.class));
    }

    @Test
    @DisplayName("Authorize declines BLOCK risk")
    void authorize_block_shouldDecline() {
        AuthorizeRequestDTO dto = new AuthorizeRequestDTO();
        dto.setTerminalId(1L);
        dto.setAmount(75000.0);
        dto.setCurrency("INR");

        when(terminalService.getEntityById(1L)).thenReturn(terminal);
        when(batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)).thenReturn(Optional.of(openBatch));
        when(riskService.checkRisk(75000.0, null, "TID-001"))
                .thenReturn(new RiskCheckResultDTO("BLOCK", 75, "High Amount Block"));
        when(authRepo.save(any(AuthMessage.class))).thenAnswer(invocation -> {
            AuthMessage auth = invocation.getArgument(0);
            auth.setAuthId(11L);
            return auth;
        });

        AuthResponseDTO result = switchService.authorize(dto);

        assertEquals("DECLINED", result.getStatus());
        assertEquals("05", result.getResponseCode());
        assertEquals("High Amount Block", result.getRiskReason());
    }

    @Test
    @DisplayName("Authorize masks PAN before save")
    void authorize_pan_shouldMask() {
        AuthorizeRequestDTO dto = new AuthorizeRequestDTO();
        dto.setTerminalId(1L);
        dto.setAmount(500.0);
        dto.setCurrency("INR");
        dto.setPanMasked("4532123456789012");

        when(terminalService.getEntityById(1L)).thenReturn(terminal);
        when(batchRepo.findByTerminalAndStatus(terminal, BatchStatus.OPEN)).thenReturn(Optional.of(openBatch));
        when(riskService.checkRisk(eq(500.0), eq("4532123456789012"), eq("TID-001")))
                .thenReturn(new RiskCheckResultDTO("ALLOW", 0, "All checks passed"));
        when(authRepo.save(any(AuthMessage.class))).thenAnswer(invocation -> {
            AuthMessage auth = invocation.getArgument(0);
            assertEquals("************9012", auth.getPanMasked());
            auth.setAuthId(12L);
            return auth;
        });

        switchService.authorize(dto);

        verify(authRepo).save(any(AuthMessage.class));
    }

    @Test
    @DisplayName("Void rejects non-approved txn")
    void void_nonApproved_shouldThrow() {
        AuthMessage declined = new AuthMessage();
        declined.setAuthId(50L);
        declined.setStatus(TxnStatus.DECLINED);

        VoidRequestDTO dto = new VoidRequestDTO();
        dto.setOriginalAuthId(50L);
        dto.setTerminalId(1L);

        when(authRepo.findById(50L)).thenReturn(Optional.of(declined));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> switchService.voidTransaction(dto));
        assertTrue(ex.getMessage().contains("non-approved"));
    }

    @Test
    @DisplayName("Void rejects settled txn")
    void void_settled_shouldThrow() {
        AuthMessage approved = new AuthMessage();
        approved.setAuthId(60L);
        approved.setStatus(TxnStatus.APPROVED);
        approved.setTxnType("SALE");

        VoidRequestDTO dto = new VoidRequestDTO();
        dto.setOriginalAuthId(60L);
        dto.setTerminalId(1L);

        Txn settled = new Txn();
        settled.setAuthMessage(approved);
        settled.setSettled(true);

        when(authRepo.findById(60L)).thenReturn(Optional.of(approved));
        when(txnRepository.findAll()).thenReturn(List.of(settled));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> switchService.voidTransaction(dto));
        assertTrue(ex.getMessage().contains("settled"));
    }

    @Test
    @DisplayName("Refund requires settled original transaction")
    void refund_unsettled_shouldThrow() {
        AuthMessage original = new AuthMessage();
        original.setAuthId(70L);
        original.setStatus(TxnStatus.APPROVED);
        original.setAmount(1000.0);
        original.setCurrency("INR");

        RefundRequestDTO dto = new RefundRequestDTO();
        dto.setOriginalAuthId(70L);
        dto.setTerminalId(1L);
        dto.setAmount(100.0);
        dto.setCurrency("INR");

        when(authRepo.findById(70L)).thenReturn(Optional.of(original));
        when(txnRepository.findAll()).thenReturn(List.of());

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> switchService.refundTransaction(dto));
        assertTrue(ex.getMessage().contains("not settled"));
    }
}
