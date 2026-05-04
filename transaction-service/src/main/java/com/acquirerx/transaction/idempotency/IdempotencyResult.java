package com.acquirerx.transaction.idempotency;

import lombok.Getter;

@Getter
public class IdempotencyResult<T> {

    private final T response;
    private final boolean replayed;
    private final int httpStatus;

    private IdempotencyResult(T response, boolean replayed, int httpStatus) {
        this.response = response;
        this.replayed = replayed;
        this.httpStatus = httpStatus;
    }

    public static <T> IdempotencyResult<T> fresh(T response) {
        return new IdempotencyResult<>(response, false, 200);
    }

    public static <T> IdempotencyResult<T> replayed(T response, int httpStatus) {
        return new IdempotencyResult<>(response, true, httpStatus);
    }
}
