package com.acquirerx.transaction.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String message;
    private T data;
    private Boolean success;
    private LocalDateTime timestamp;
    private Integer status;
    private String traceId;

    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
        this.success = true;
        this.timestamp = LocalDateTime.now();
        this.status = 200;
    }
}
