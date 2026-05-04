package com.acquirerx.backend.fee.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "fee_rule")
public class FeeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeRuleId;

    private String ruleType;

    private String description;

    private Double ratePct;

    private Double flatFee;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private Boolean active;
}
