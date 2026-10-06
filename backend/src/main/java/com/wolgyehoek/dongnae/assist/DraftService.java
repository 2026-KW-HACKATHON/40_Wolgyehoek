package com.wolgyehoek.dongnae.assist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DraftService {

    private static final Logger log = LoggerFactory.getLogger(DraftService.class);

    private final AnthropicClient anthropicClient;

    public DraftService(AnthropicClient anthropicClient) {
        this.anthropicClient = anthropicClient;
    }

    public DraftResponse draft(String text) {
        DraftResponse rule = DraftRule.fromText(text);
        if (!anthropicClient.enabled()) {
            return rule;
        }
        try {
            Map<String, String> ai = anthropicClient.draft(text);
            return new DraftResponse(
                    pick(ai.get("제목"), rule.title()),
                    pick(ai.get("대상"), rule.target()),
                    pick(ai.get("장소"), rule.place()),
                    pick(ai.get("효과"), rule.effect()),
                    DraftSource.LLM);
        } catch (Exception e) {
            log.warn("AI 초안 생성 실패, 규칙 기반으로 대체: {}", e.getMessage());
            return rule;
        }
    }

    private String pick(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }
}