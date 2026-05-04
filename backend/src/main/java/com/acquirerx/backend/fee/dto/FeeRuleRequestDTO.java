package com.acquirerx.backend.fee.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FeeRuleRequestDTO {

    @NotBlank(message = "Rule type is required")
        @Pattern(regexp = "^(MDR|SCHEME|INTERCHANGE|MARKUP)$",
            message = "Rule type must be MDR, SCHEME, INTERCHANGE, or MARKUP")
    private String ruleType;

    private String description;

    @NotNull(message = "Rate percentage is required")
    @Min(value = 0, message = "Rate cannot be negative")
    @Max(value = 100, message = "Rate cannot exceed 100%")
    private Double ratePct;

    @Min(value = 0, message = "Flat fee cannot be negative")
    private Double flatFee;             // Optional — defaults to 0

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;      // Optional — null means no end date
}
