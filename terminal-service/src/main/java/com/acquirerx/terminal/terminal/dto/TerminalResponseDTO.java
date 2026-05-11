package com.acquirerx.terminal.terminal.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TerminalResponseDTO {

    private Long terminalId;
    private String tid;
    private String brandModel;
    private String capability;
    private String status;
    private Long storeId;
    private String storeName;
    private Long merchantId;
    private String merchantName;
    private Long paramProfileId;
    private String paramProfileName;
    private String paramsJson;
    private LocalDateTime createdAt;
}
