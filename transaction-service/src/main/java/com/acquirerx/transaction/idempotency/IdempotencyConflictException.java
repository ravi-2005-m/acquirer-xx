package com.acquirerx.transaction.idempotency;

import com.acquirerx.transaction.common.error.ErrorCode;
import com.acquirerx.transaction.common.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class IdempotencyConflictException extends BusinessException {
    public IdempotencyConflictException(String message) {
        super(ErrorCode.IDEMPOTENCY_KEY_REUSED, HttpStatus.CONFLICT, message);
    }
}
