package com.acquirerx.ops.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String message;
    private T data;
    private Boolean success = true;
    private LocalDateTime timestamp = LocalDateTime.now();
    private Integer status = 200;

    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
    }
}


