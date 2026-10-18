package com.gustavo.finance.finance_control.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConversionException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import tools.jackson.databind.JsonNode;
import com.gustavo.finance.finance_control.exception.AiIntegrationException;

@Component
public class GeminiInsightClient {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiInsightClient(
        @Value("${app.ai.gemini.api-key:}") String apiKey,
        @Value("${app.ai.gemini.model:gemini-3.8-flash}") String model
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

            String insight = extractText(response);

            if (insight.isBlank()) {
                throw new AiIntegrationException(
                    "The AI service did not return a financial insight."
                );
            }

            return insight.trim();
        } catch (RestClientResponseException exception) {
            throw new AiIntegrationException(providerErrorMessage(exception.getStatusCode().value()));
        } catch (HttpMessageConversionException exception) {
            throw new AiIntegrationException("The financial insight service returned an invalid response.");
        } catch (RestClientException exception) {
            if (exception.getCause() instanceof HttpMessageConversionException) {
                throw new AiIntegrationException("The financial insight service returned an invalid response.");
            }
            throw new AiIntegrationException(
                "The financial insight service is temporarily unavailable."
            );
        }
    }

    private String extractText(JsonNode response) {
        if (response == null) {
            return "";
        }

        JsonNode parts = response.path("candidates").path(0).path("content").path("parts");
        StringBuilder text = new StringBuilder();
        for (JsonNode part : parts) {
            if (part.path("thought").asBoolean(false)) {
                continue;
            }
            String partText = part.path("text").asText("");
            if (!partText.isBlank()) {
                text.append(partText);
            }
        }
        return text.toString().trim();
    }

    private String providerErrorMessage(int status) {
        if (status == 429) {
            return "The AI request limit was reached. Please try again later or check your API quota.";
        }
        if (status == 401 || status == 403) {
            return "The AI provider rejected the configured credentials or project permissions.";
        }
        if (status == 404) {
            return "The configured AI model is unavailable. Check the Gemini model configuration.";
        }
        if (status == 400) {
            return "The AI provider rejected the request. Check the Gemini model configuration.";
        }
        return "The financial insight service is temporarily unavailable.";
    }
}
