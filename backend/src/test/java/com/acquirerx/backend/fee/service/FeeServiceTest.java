package com.acquirerx.backend.fee.service;

import com.acquirerx.backend.common.enums.Status;
import com.acquirerx.backend.fee.entity.FeeRule;
import com.acquirerx.backend.fee.entity.Txn;
import com.acquirerx.backend.fee.repository.FeeRuleRepository;
import com.acquirerx.backend.fee.repository.TxnRepository;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.service.MerchantService;
import com.acquirerx.backend.store.entity.Store;
import com.acquirerx.backend.switchmodule.entity.AuthMessage;
import com.acquirerx.backend.switchmodule.enums.TxnStatus;
import com.acquirerx.backend.switchmodule.service.SwitchService;
import com.acquirerx.backend.terminal.entity.Terminal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeeServiceTest {

    @Mock
    private FeeRuleRepository feeRuleRepository;
    @Mock
    private TxnRepository txnRepository;
    @Mock
    private SwitchService switchService;
    @Mock
    private MerchantService merchantService;

    @InjectMocks
    private FeeService feeService;

    @Test
    @DisplayName("Calculate fee with MDR only")
    void calculateFee_singleRule_shouldCalculate() {
        FeeRule mdr = new FeeRule();
        mdr.setRuleType("MDR");
        mdr.setRatePct(2.0);
        mdr.setFlatFee(0.0);

        when(feeRuleRepository.findByActiveTrue()).thenReturn(List.of(mdr));

        double fee = feeService.calculateFee(1000.0);

        assertEquals(20.0, fee);
    }

    @Test
    @DisplayName("Calculate fee returns zero when no active rules")
    void calculateFee_noRule_shouldReturnZero() {
        when(feeRuleRepository.findByActiveTrue()).thenReturn(Collections.emptyList());

        double fee = feeService.calculateFee(1000.0);

        assertEquals(0.0, fee);
    }

    @Test
    @DisplayName("Create txn from approved auth calculates fees and net")
    void createTxnFromAuth_approved_shouldPersistTxn() {
        AuthMessage auth = new AuthMessage();
        auth.setAuthId(10L);
        auth.setStatus(TxnStatus.APPROVED);
        auth.setAmount(1000.0);
        auth.setCurrency("INR");

        Merchant merchant = new Merchant();
        merchant.setMerchantId(1L);
        merchant.setLegalName("ABC");
        merchant.setStatus(Status.ACTIVE);

        Store store = new Store();
        store.setStoreId(2L);
        store.setStoreName("Main");
        store.setMerchant(merchant);

        Terminal terminal = new Terminal();
        terminal.setTerminalId(3L);
        terminal.setTid("TID-001");
        terminal.setStore(store);

        auth.setMerchant(merchant);
        auth.setTerminal(terminal);

        FeeRule scheme = new FeeRule();
        scheme.setRuleType("SCHEME");
        scheme.setRatePct(1.0);
        scheme.setFlatFee(0.0);

        FeeRule markup = new FeeRule();
        markup.setRuleType("MDR");
        markup.setRatePct(1.5);
        markup.setFlatFee(2.0);

        when(switchService.getAuthEntityById(10L)).thenReturn(auth);
        when(feeRuleRepository.findByActiveTrue()).thenReturn(List.of(scheme, markup));
        when(txnRepository.save(any(Txn.class))).thenAnswer(invocation -> {
            Txn txn = invocation.getArgument(0);
            txn.setTxnId(99L);
            return txn;
        });

        var result = feeService.createTxnFromAuth(10L);

        assertEquals(99L, result.getTxnId());
        assertEquals(27.0, result.getTotalFee());
        assertEquals(973.0, result.getNetMerchantAmount());
        verify(txnRepository).save(any(Txn.class));
    }

    @Test
    @DisplayName("Create txn from non-approved auth throws")
    void createTxnFromAuth_declined_shouldThrow() {
        AuthMessage auth = new AuthMessage();
        auth.setAuthId(11L);
        auth.setStatus(TxnStatus.DECLINED);

        when(switchService.getAuthEntityById(11L)).thenReturn(auth);

        assertThrows(IllegalStateException.class, () -> feeService.createTxnFromAuth(11L));
    }
}
