package com.acquirerx.backend.merchant.service;

import com.acquirerx.backend.common.enums.RiskLevel;
import com.acquirerx.backend.exception.ResourceNotFoundException;
import com.acquirerx.backend.merchant.dto.MerchantRequestDTO;
import com.acquirerx.backend.merchant.entity.Merchant;
import com.acquirerx.backend.merchant.repository.MerchantRepository;
import com.acquirerx.backend.store.repository.StoreRepository;
import com.acquirerx.backend.terminal.repository.TerminalRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MerchantServiceTest {

    @Mock
    private MerchantRepository repository;
    @Mock
    private StoreRepository storeRepository;
    @Mock
    private TerminalRepository terminalRepository;

    @InjectMocks
    private MerchantService merchantService;

    @Test
    @DisplayName("Create merchant success defaults to LOW risk")
    void create_success_shouldDefaultRisk() {
        MerchantRequestDTO dto = new MerchantRequestDTO();
        dto.setLegalName("ABC Supermarket");
        dto.setContactInfo("9876543210");
        dto.setMcc("5411");

        when(repository.existsByLegalName("ABC Supermarket")).thenReturn(false);
        when(repository.save(any(Merchant.class))).thenAnswer(invocation -> {
            Merchant merchant = invocation.getArgument(0);
            merchant.setMerchantId(1L);
            return merchant;
        });

        var result = merchantService.create(dto);

        assertEquals("ABC Supermarket", result.getLegalName());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("LOW", result.getRiskLevel());
    }

    @Test
    @DisplayName("Create merchant rejects duplicate legal name")
    void create_duplicate_shouldThrow() {
        MerchantRequestDTO dto = new MerchantRequestDTO();
        dto.setLegalName("ABC Supermarket");
        dto.setContactInfo("123");

        when(repository.existsByLegalName("ABC Supermarket")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> merchantService.create(dto));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Create merchant preserves provided risk level")
    void create_customRisk_shouldPreserve() {
        MerchantRequestDTO dto = new MerchantRequestDTO();
        dto.setLegalName("FuelMax");
        dto.setContactInfo("123");
        dto.setRiskLevel(RiskLevel.HIGH);

        when(repository.existsByLegalName("FuelMax")).thenReturn(false);
        when(repository.save(any(Merchant.class))).thenAnswer(invocation -> {
            Merchant merchant = invocation.getArgument(0);
            merchant.setMerchantId(2L);
            return merchant;
        });

        var result = merchantService.create(dto);

        assertEquals("HIGH", result.getRiskLevel());
    }

    @Test
    @DisplayName("getEntityById throws not found")
    void getEntityById_notFound_shouldThrow() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> merchantService.getEntityById(999L));
    }
}
