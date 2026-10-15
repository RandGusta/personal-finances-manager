package com.gustavo.finance.finance_control.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.databind.JsonNode;
import com.gustavo.finance.finance_control.exception.AiIntegrationException;

@Component
public class GeminiInsightClient {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiInsightClient(
        @Value("${app.ai.gemini.api-key:}") String apiKey,
        @Value("${app.ai.gemini.model:gemini-2.5-flash}") String model
    ) {
        this.restClient = RestClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com")
            .build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public String generateInsight(String prompt) {
        if (apiKey.isBlank()) {
            throw new AiIntegrationException(
                "Financial insights are not configured. Set the GEMINI_API_KEY environment variable."
            );
        }

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            ),
            "generationConfig", Map.of(
                "temperature", 0.2,
                "maxOutputTokens", 250
            )
        );

        try {
            JsonNode response = restClient.post()
                .uri("/v1beta/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

            String insight = response == null
                ? ""
                : response.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText();

            if (insight.isBlank()) {
                throw new AiIntegrationException(
                    "The AI service did not return a financial insight."
                );
            }

            return insight.trim();
        } catch (RestClientException exception) {
            throw new AiIntegrationException(
                "The financial insight service is temporarily unavailable."
            );
        }
    }
}
