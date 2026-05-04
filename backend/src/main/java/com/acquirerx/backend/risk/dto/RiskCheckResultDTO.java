package com.acquirerx.backend.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RiskCheckResultDTO {

    private String result;
    private Integer score;
    private String reason;
}
