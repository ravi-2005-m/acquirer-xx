package com.acquirerx.transaction.fee.service;

import com.acquirerx.transaction.client.MerchantServiceClient;
import com.acquirerx.transaction.fee.dto.FeeBreakdownDTO;
import com.acquirerx.transaction.fee.entity.FeeRule;
import com.acquirerx.transaction.fee.entity.Txn;
import com.acquirerx.transaction.fee.repository.FeeRuleRepository;
import com.acquirerx.transaction.fee.repository.TxnRepository;
import com.acquirerx.transaction.switchmodule.entity.AuthMessage;
import com.acquirerx.transaction.switchmodule.enums.TxnStatus;
import com.acquirerx.transaction.switchmodule.repository.AuthMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeeServiceTest {

    @Mock
    private FeeRuleRepository feeRuleRepo;

    @Mock
    private TxnRepository txnRepo;

    @Mock
    private AuthMessageRepository authRepo;

    @Mock
    private MerchantServiceClient merchantClient;

    @Mock
    private FeeRuleMatcher ruleMatcher;

    @InjectMocks
    private FeeService feeService;

    private FeeRule activeRule;

    @BeforeEach
    void setUp() {
        activeRule = new FeeRule();
        activeRule.setCardType("CREDIT_CARD");
        activeRule.setTransactionType("SALE");
        activeRule.setSchemePercentage(new BigDecimal("1.0"));
        activeRule.setInterchangePercentage(new BigDecimal("1.5"));
        activeRule.setAcquirerMarkupPercentage(new BigDecimal("0.0"));
        activeRule.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("calculateFees should break down all fee components")
    void calculateFees_shouldBreakdownAllFeeComponents() {
        when(feeRuleRepo.findByStatusOrderByPriorityAsc("ACTIVE")).thenReturn(List.of(activeRule));
        when(ruleMatcher.matches(any(FeeRule.class), anyString(), anyString(), any(BigDecimal.class), anyString()))
            .thenReturn(true);

        FeeBreakdownDTO result = feeService.calculateFees(new BigDecimal("1000.00"), "5411", "NA", "V");

        assertEquals(new BigDecimal("10.0000"), result.getSchemeFee());
        assertEquals(new BigDecimal("15.0000"), result.getInterchangeFee());
        assertEquals(new BigDecimal("0.0000"), result.getAcquirerMarkup());
        assertEquals(new BigDecimal("25.0000"), result.getTotalFee());
        assertEquals(new BigDecimal("975.0000"), result.getNetMerchantAmount());
    }

    @Test
    @DisplayName("calculateFees returns zero fee when no active rules")
    void calculateFees_shouldReturnZeroWhenNoActiveRules() {
        when(feeRuleRepo.findByStatusOrderByPriorityAsc("ACTIVE")).thenReturn(List.of());

        FeeBreakdownDTO result = feeService.calculateFees(new BigDecimal("1000.00"));

        assertEquals(new BigDecimal("0.0000"), result.getSchemeFee());
        assertEquals(new BigDecimal("0.0000"), result.getTotalFee());
        assertEquals(new BigDecimal("1000.0000"), result.getNetMerchantAmount());
    }

    @Test
    @DisplayName("calculateFees throws when amount is null")
    void calculateFees_shouldThrowWhenAmountIsNull() {
        assertThrows(IllegalArgumentException.class,
                () -> feeService.calculateFees(null));
    }

    @Test
    @DisplayName("createTxnFromAuth should persist fee breakdown")
    void createTxnFromAuth_shouldPersistTxnWithFeeBreakdown() {
        AuthMessage auth = new AuthMessage();
        auth.setAuthId(10L);
        auth.setStatus(TxnStatus.APPROVED);
        auth.setAmount(new BigDecimal("1000.00"));
        auth.setCurrency("INR");
        auth.setMerchantId(1L);
        auth.setTerminalId(2L);
        auth.setMerchantName("Smoke Merchant");
        auth.setTid("TID-001");
        auth.setTxnType("SALE");
        auth.setMerchantMcc("5411");
        auth.setMerchantRegion("NA");
        auth.setNetwork("V");

        when(authRepo.findById(10L)).thenReturn(Optional.of(auth));
        when(feeRuleRepo.findByStatusOrderByPriorityAsc("ACTIVE")).thenReturn(List.of(activeRule));
        when(ruleMatcher.matches(any(FeeRule.class), anyString(), anyString(), any(BigDecimal.class), anyString()))
            .thenReturn(true);
        Map<String, Object> merchantData = new HashMap<>();
        merchantData.put("mcc", "5411");
        merchantData.put("region", "NA");
        when(merchantClient.getMerchantById(1L)).thenReturn(Map.of("data", merchantData));
        when(txnRepo.save(any(Txn.class))).thenAnswer(invocation -> {
            Txn txn = invocation.getArgument(0);
            txn.setTxnId(99L);
            return txn;
        });

        var result = feeService.createTxnFromAuth(10L);

        assertEquals(99L, result.getTxnId());
        assertEquals(new BigDecimal("10.0000"), result.getSchemeFee());
        assertEquals(new BigDecimal("15.0000"), result.getInterchangeFee());
        assertEquals(new BigDecimal("0.0000"), result.getAcquirerMarkup());
        assertEquals(new BigDecimal("25.0000"), result.getTotalFee());
        assertEquals(new BigDecimal("975.0000"), result.getNetMerchantAmount());
    }

    @Test
    @DisplayName("createTxnFromAuth throws for non-approved auth")
    void createTxnFromAuth_shouldThrowForNonApprovedAuth() {
        AuthMessage auth = new AuthMessage();
        auth.setAuthId(11L);
        auth.setStatus(TxnStatus.DECLINED);

        when(authRepo.findById(11L)).thenReturn(Optional.of(auth));

        assertThrows(IllegalStateException.class, () -> feeService.createTxnFromAuth(11L));
    }
}