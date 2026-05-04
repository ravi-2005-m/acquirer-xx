package com.acquirerx.transaction.common.exception;

import com.acquirerx.transaction.common.error.ErrorCode;
import org.springframework.http.HttpStatus;

import java.util.Map;

public class ConflictException extends BusinessException {
    public ConflictException(String message) {
        super(ErrorCode.CONFLICT, HttpStatus.CONFLICT, message);
    }

    public ConflictException(String message, Map<String, Object> details) {
        super(ErrorCode.CONFLICT, HttpStatus.CONFLICT, message, details);
    }
}
