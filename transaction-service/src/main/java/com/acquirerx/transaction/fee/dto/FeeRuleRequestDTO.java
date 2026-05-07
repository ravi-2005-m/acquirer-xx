package com.acquirerx.transaction.fee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FeeRuleRequestDTO {

    @NotBlank(message = "Card type is required")
    private String cardType;

    @NotBlank(message = "Transaction type is required")
    private String transactionType;

    @NotNull(message = "Scheme percentage is required")
    private BigDecimal schemePercentage;

    @NotNull(message = "Interchange percentage is required")
    private BigDecimal interchangePercentage;

    @NotNull(message = "Acquirer markup percentage is required")
    private BigDecimal acquirerMarkupPercentage;

    @Size(max = 10)
    private String mccPattern;

    @Pattern(regexp = "^(NA|EU|APAC|LATAM)?$", message = "Region must be NA, EU, APAC, LATAM, or null")
    private String region;

    @DecimalMin(value = "0.0")
    @Digits(integer = 15, fraction = 4)
    private BigDecimal minAmount;

    @DecimalMin(value = "0.0")
    @Digits(integer = 15, fraction = 4)
    private BigDecimal maxAmount;

    @Pattern(regexp = "^(V|M|U|LocalSim)?$", message = "Network must be V, M, U, LocalSim, or null")
    private String network;

    @Min(value = 1, message = "Priority must be >= 1")
    @Max(value = 999, message = "Priority must be <= 999")
    private Integer priority = 100;

    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
}
