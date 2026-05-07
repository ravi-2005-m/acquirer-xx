package com.acquirerx.transaction.switchmodule.dto;

import com.acquirerx.transaction.common.validation.ValidationConstants;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthorizeRequestDTO {

    @NotNull(message = "Terminal ID is required")
    @Positive(message = "Terminal ID must be positive")
    private Long terminalId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 15, fraction = 2, message = "Amount format is invalid")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters (e.g. INR)")
    @Pattern(regexp = ValidationConstants.CURRENCY_REGEX, message = "Currency must be 3 uppercase letters")
    private String currency;

    @NotBlank(message = "PAN must be provided in masked format")
    @Pattern(regexp = "^[0-9]{6}[*X]{3,9}[0-9]{4}$", message = "PAN must be masked (e.g. 453201******0366)")
    private String panMasked;

    @Pattern(regexp = ValidationConstants.TXN_TYPE_REGEX, message = "Transaction type must be SALE, VOID, or REFUND")
    private String txnType;
}
