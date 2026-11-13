package com.gustavo.finance.finance_control.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;
import com.gustavo.finance.finance_control.exception.AiIntegrationException;

class GeminiInsightClientTest {
    @Test
    void shouldReadActualJsonResponseWithTheConfiguredSpringConverter() throws Exception {
        assertEquals("Review your spending.", generate(200, """
            {"candidates":[{"content":{"parts":[{"text":"Review your spending."}]}}]}
            """));
    }

    @Test
    void shouldJoinTextPartsWithoutReturningThoughtParts() throws Exception {
        assertEquals("First tip. Second tip.", generate(200, """
            {"candidates":[{"content":{"parts":[
                {"thought":true,"text":"Internal reasoning"},
                {"text":"First tip. "},{"text":"Second tip."}
            ]}}]}
            """));
    }

    @Test
    void shouldReportModelUnavailableWithoutExposingProviderBody() {
        AtomicInteger requests = new AtomicInteger();
        AiIntegrationException exception = assertThrows(AiIntegrationException.class,
            () -> generate(requests, "{\"error\":{\"message\":\"private-provider-detail\"}}", 404));
        assertEquals("The configured AI model is unavailable. Check the Gemini model configuration.", exception.getMessage());
        assertEquals(1, requests.get());
    }

    @Test
    void shouldReportQuotaLimit() {
        AtomicInteger requests = new AtomicInteger();
        AiIntegrationException exception = assertThrows(AiIntegrationException.class,
            () -> generate(requests, "{\"error\":{\"message\":\"private-quota-detail\"}}", 429));
        assertEquals("The AI request limit was reached. Please try again later or check your API quota.", exception.getMessage());
        assertEquals(1, requests.get());
    }

    @Test
    void shouldRetryTemporaryProviderErrorsAndReturnTheSuccessfulInsight() throws Exception {
        AtomicInteger requests = new AtomicInteger();
        String insight = generate(requests, """
            {"candidates":[{"content":{"parts":[{"text":"Review your spending."}]}}]}
            """, 503, 500, 200);

        assertEquals("Review your spending.", insight);
        assertEquals(3, requests.get());
    }

    @Test
    void shouldStopAfterThreeAttemptsWhenTheProviderRemainsUnavailable() {
        AtomicInteger requests = new AtomicInteger();
        AiIntegrationException exception = assertThrows(AiIntegrationException.class,
            () -> generate(requests, "{\"error\":{\"message\":\"private-provider-detail\"}}", 503));

        assertEquals("The financial insight service is temporarily unavailable.", exception.getMessage());
        assertEquals(3, requests.get());
    }

    @Test
    void shouldRejectMalformedJsonAsAnIntegrationError() {
        AiIntegrationException exception = assertThrows(AiIntegrationException.class,
            () -> generate(200, "not-json"));
        assertEquals("The financial insight service returned an invalid response.", exception.getMessage());
    }

    @Test
    void shouldRejectResponseWithoutGeneratedText() {
        AiIntegrationException exception = assertThrows(AiIntegrationException.class,
            () -> generate(200, "{\"candidates\":[]}"));
        assertEquals("The AI service did not return a financial insight.", exception.getMessage());
    }

    @Test
    void shouldNotReturnPartialTextWhenTheOutputLimitIsReached() {
        AiIntegrationException exception = assertThrows(AiIntegrationException.class,
            () -> generate(200, """
                {"candidates":[{"finishReason":"MAX_TOKENS", "content":{"parts":[
                    {"text":"* **Total Balance:** Your"}
                ]}}]}
                """));
        assertEquals("The AI response was cut short. Please generate the insight again.", exception.getMessage());
    }

    private String generate(int status, String responseJson) throws Exception {
        return generate(new AtomicInteger(), responseJson, status);
    }

    private String generate(AtomicInteger requests, String responseJson, int... statuses) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            int requestIndex = requests.getAndIncrement();
            int status = statuses[Math.min(requestIndex, statuses.length - 1)];
            byte[] body = responseJson.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, body.length);
            try (var output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.start();
        try {
            GeminiInsightClient client = new GeminiInsightClient("test-only-key", "test-model");
            ReflectionTestUtils.setField(client, "restClient", RestClient.create(
                "http://127.0.0.1:" + server.getAddress().getPort()
            ));
            return client.generateInsight("Synthetic financial data");
        } finally {
            server.stop(0);
        }
    }
}
