package com.acquirerx.transaction;

import com.acquirerx.transaction.fee.repository.TxnRepository;
import com.acquirerx.transaction.switchmodule.entity.AuthMessage;
import com.acquirerx.transaction.switchmodule.enums.BatchStatus;
import com.acquirerx.transaction.switchmodule.entity.Batch;
import com.acquirerx.transaction.switchmodule.repository.AuthMessageRepository;
import com.acquirerx.transaction.switchmodule.repository.BatchRepository;
import com.github.tomakehurst.wiremock.WireMockServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
        "spring.cloud.openfeign.client.config.TERMINAL-SERVICE.url=http://localhost:18091",
        "spring.cloud.openfeign.client.config.RISK-SERVICE.url=http://localhost:18091"
})
class TransactionServiceIntegrationTest {

    private static WireMockServer wireMockServer;

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private AuthMessageRepository authMessageRepository;

    @MockBean
    private BatchRepository batchRepository;

    @MockBean
    private TxnRepository txnRepository;

    @BeforeAll
    static void startMocks() {
        wireMockServer = new WireMockServer(18091);
        wireMockServer.start();

        wireMockServer.stubFor(get(urlPathEqualTo("/api/v1/terminals/1"))
                .willReturn(okJson("""
                        {
                          "message": "OK",
                          "data": {
                            "terminalId": 1,
                            "tid": "TID001",
                            "merchantId": 1,
                            "merchantName": "Smoke Merchant"
                          }
                        }
                        """)));

        wireMockServer.stubFor(post(urlPathEqualTo("/api/v1/risk/check"))
                .willReturn(okJson("""
                        {
                          "message": "OK",
                          "data": {
                            "result": "ALLOW",
                            "score": 10,
                            "reason": "Default allow"
                          }
                        }
                        """)));
    }

    @AfterAll
    static void stopMocks() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }

    @Test
    void authorize_withValidRequest_shouldReturnApproved() {
        Batch openBatch = new Batch();
        openBatch.setBatchId(100L);
        openBatch.setTerminalId(1L);
        openBatch.setStatus(BatchStatus.OPEN);

        Mockito.when(batchRepository.findByTerminalIdAndStatus(1L, BatchStatus.OPEN))
                .thenReturn(Optional.of(openBatch));

        Mockito.when(authMessageRepository.save(Mockito.any()))
                .thenAnswer(invocation -> {
                                        AuthMessage auth = invocation.getArgument(0);
                    auth.setAuthId(200L);
                    return auth;
                });

        String body = """
                {
                  "terminalId": 1,
                  "amount": 500.0,
                  "currency": "INR",
                  "txnType": "SALE",
                  "panMasked": "4111111111111111"
                }
                """;

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/v1/transactions/authorize", body, String.class);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertTrue(response.getBody() != null && response.getBody().contains("APPROVED"));
    }
}