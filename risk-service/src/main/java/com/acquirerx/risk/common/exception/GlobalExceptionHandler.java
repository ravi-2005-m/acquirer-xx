package com.acquirerx.risk.common.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Pattern RAW_PAN_PATTERN = Pattern.compile("\\b(\\d[\\s-]?){13,19}\\b");

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionResponse handleResourceNotFound(ResourceNotFoundException ex) {
        return new ExceptionResponse("NOT_FOUND", sanitize(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ExceptionResponse handleIllegalArgument(IllegalArgumentException ex) {
        return new ExceptionResponse("BAD_REQUEST", sanitize(ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ExceptionResponse handleIllegalState(IllegalStateException ex) {
        return new ExceptionResponse("CONFLICT", sanitize(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        body.put("status", 400);
        return body;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getConstraintViolations().forEach(cv -> {
            String path = cv.getPropertyPath().toString();
            String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
            fieldErrors.put(field, cv.getMessage());
        });
        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation failed");
        body.put("fieldErrors", fieldErrors);
        body.put("status", 400);
        return body;
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ExceptionResponse handleGeneric(Exception ex) {
        return new ExceptionResponse("ERROR", "An unexpected error occurred");
    }

    private String sanitize(String message) {
        if (message == null) {
            return null;
        }
        return RAW_PAN_PATTERN.matcher(message).replaceAll("[MASKED_PAN]");
    }

    public static class ExceptionResponse {
        private String code;
        private String message;

        public ExceptionResponse(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }
    }
}
