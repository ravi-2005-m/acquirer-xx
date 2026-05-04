package com.acquirerx.backend.terminal.dto;

import lombok.Data;

@Data
public class TerminalFilterDTO {

    private String tid;
    private String brandModel;
    private String capability;
    private String status;
    private Long storeId;
    private Long merchantId;
}
