package com.acquirerx.transaction.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private IdempotencyRecordRepository repo;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private IdempotencyService service;

    @Test
    void execute_firstTime_shouldExecuteOperation() {
        when(repo.findByIdempotencyKeyAndEndpoint(any(), any()))
                .thenReturn(Optional.empty());

        AtomicInteger counter = new AtomicInteger(0);
        IdempotencyResult<String> result = service.execute(
                "key-1", "POST /test", Map.of("data", "abc"),
                () -> {
                    counter.incrementAndGet();
                    return "success";
                },
                String.class
        );

        assertEquals(1, counter.get());
        assertFalse(result.isReplayed());
        assertEquals("success", result.getResponse());
        verify(repo).save(any(IdempotencyRecord.class));
    }

    @Test
    void execute_sameKeySameBody_shouldReplay() throws Exception {
        String responseJson = objectMapper.writeValueAsString("cached-value");
        String requestJson = objectMapper.writeValueAsString(Map.of("data", "abc"));
        String requestHash = java.security.MessageDigest.getInstance("SHA-256")
                .digest(requestJson.getBytes(java.nio.charset.StandardCharsets.UTF_8))
                .toString();

        IdempotencyRecord cached = new IdempotencyRecord();
        cached.setIdempotencyKey("key-1");
        cached.setEndpoint("POST /test");
        cached.setRequestHash(hashFor(Map.of("data", "abc")));
        cached.setResponseBody(responseJson);
        cached.setResponseStatus(200);
        cached.setCreatedAt(LocalDateTime.now());
        cached.setExpiresAt(LocalDateTime.now().plusHours(24));

        when(repo.findByIdempotencyKeyAndEndpoint(eq("key-1"), eq("POST /test")))
                .thenReturn(Optional.of(cached));

        AtomicInteger counter = new AtomicInteger(0);
        IdempotencyResult<String> result = service.execute(
                "key-1", "POST /test", Map.of("data", "abc"),
                () -> {
                    counter.incrementAndGet();
                    return "fresh-value";
                },
                String.class
        );

        assertEquals(0, counter.get());
        assertTrue(result.isReplayed());
        assertEquals("cached-value", result.getResponse());
        verify(repo, never()).save(any());
    }

    @Test
    void execute_sameKeyDifferentBody_shouldThrowConflict() {
        IdempotencyRecord cached = new IdempotencyRecord();
        cached.setRequestHash("different-hash");

        when(repo.findByIdempotencyKeyAndEndpoint(any(), any()))
                .thenReturn(Optional.of(cached));

        assertThrows(IdempotencyConflictException.class, () ->
                service.execute("key-1", "POST /test", Map.of("data", "abc"),
                        () -> "value", String.class)
        );
    }

    private String hashFor(Object request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
