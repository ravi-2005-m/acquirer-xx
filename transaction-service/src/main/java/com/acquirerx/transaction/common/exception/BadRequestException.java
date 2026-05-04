package com.acquirerx.transaction.common.exception;

import com.acquirerx.transaction.common.error.ErrorCode;
import org.springframework.http.HttpStatus;

import java.util.Map;

public class BadRequestException extends BusinessException {
    public BadRequestException(String message) {
        super(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, message);
    }

    public BadRequestException(String message, Map<String, Object> details) {
        super(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, message, details);
    }
}
