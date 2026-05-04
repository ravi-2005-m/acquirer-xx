package com.acquirerx.ops.dispute.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DisputeFilterDTO {

    private String stage;
    private String status;
    private String reasonCode;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private Long merchantId;
    private Boolean deadlineExpired;
}


