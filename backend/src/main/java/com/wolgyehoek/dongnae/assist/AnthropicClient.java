package com.wolgyehoek.dongnae.assist;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AnthropicClient {

    private static final String SYSTEM_PROMPT = """
            주민이 쓴 동네 아이디어를 검증 카드 초안으로 정리한다.
            원문에 없는 사실은 만들지 않는다. 아래 네 줄 형식으로만 한국어로 답한다.
            제목: (40자 이내)
            대상:
            장소:
            효과:
            """;

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public AnthropicClient(@Value("${dongnae.ai.api-key}") String apiKey,
                           @Value("${dongnae.ai.model:claude-haiku-4-5-20251001}") String model) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(8));

        this.restClient = RestClient.builder()
                .baseUrl("https://api.anthropic.com")
                .requestFactory(factory)
                .build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean enabled() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Map<String, String> draft(String text) {
        MessagesResponse response = restClient.post()
                .uri("/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new MessagesRequest(model, 300, SYSTEM_PROMPT, List.of(new Message("user", text))))
                .retrieve()
                .body(MessagesResponse.class);

        String answer = (response == null || response.content() == null) ? "" :
                response.content().stream()
                        .filter(c -> "text".equals(c.type()))
                        .map(Content::text)
                        .findFirst()
                        .orElse("");
        return parseLines(answer);
    }

    static Map<String, String> parseLines(String answer) {
        Map<String, String> result = new HashMap<>();
        for (String line : answer.split("\n")) {
            int colon = line.indexOf(':');
            if (colon > 0) {
                result.put(line.substring(0, colon).trim(), line.substring(colon + 1).trim());
            }
        }
        return result;
    }

    record MessagesRequest(String model, @JsonProperty("max_tokens") int maxTokens,
                           String system, List<Message> messages) {
    }

    record Message(String role, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record MessagesResponse(List<Content> content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Content(String type, String text) {
    }
}