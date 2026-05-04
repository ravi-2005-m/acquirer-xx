package com.acquirerx.transaction.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyRecordRepository repo;
    private final ObjectMapper objectMapper;

    private static final int DEFAULT_TTL_HOURS = 24;

    @Transactional
    public <T> IdempotencyResult<T> execute(String key, String endpoint,
                                            Object request, Supplier<T> operation,
                                            Class<T> responseType) {

        String requestHash = hashRequest(request);

        Optional<IdempotencyRecord> existing =
                repo.findByIdempotencyKeyAndEndpoint(key, endpoint);

        if (existing.isPresent()) {
            IdempotencyRecord record = existing.get();

            if (!record.getRequestHash().equals(requestHash)) {
                log.warn("Idempotency key reused with different request: key={}, endpoint={}",
                        key, endpoint);
                throw new IdempotencyConflictException(
                        "Idempotency-Key '" + key + "' was used with a different request body. " +
                                "Use a new key for a different request."
                );
            }

            log.info("Replaying cached idempotent response: key={}, endpoint={}", key, endpoint);
            try {
                T cachedResponse = objectMapper.readValue(record.getResponseBody(), responseType);
                Integer status = record.getResponseStatus();
                int httpStatus = status != null ? status.intValue() : 200;
                return IdempotencyResult.replayed(cachedResponse, httpStatus);
            } catch (Exception e) {
                log.error("Failed to deserialize cached response", e);
                throw new RuntimeException("Cached response deserialization failed", e);
            }
        }

        log.info("Executing fresh idempotent operation: key={}, endpoint={}", key, endpoint);
        T response = operation.get();

        try {
            IdempotencyRecord record = new IdempotencyRecord();
            record.setIdempotencyKey(key);
            record.setEndpoint(endpoint);
            record.setRequestHash(requestHash);
            record.setResponseBody(objectMapper.writeValueAsString(response));
            record.setResponseStatus(200);
            record.setCreatedAt(LocalDateTime.now());
            record.setExpiresAt(LocalDateTime.now().plusHours(DEFAULT_TTL_HOURS));
            repo.save(record);
        } catch (Exception e) {
            log.error("Failed to cache idempotency record — operation still succeeded", e);
        }

        return IdempotencyResult.fresh(response);
    }

    private String hashRequest(Object request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(json.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash request", e);
        }
    }
}
