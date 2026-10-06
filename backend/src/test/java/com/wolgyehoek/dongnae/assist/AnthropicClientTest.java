package com.wolgyehoek.dongnae.assist;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AnthropicClientTest {

    @Test
    void 네_줄_답변을_항목별로_나눈다() {
        Map<String, String> result = AnthropicClient.parseLines("""
                제목: 경춘선숲길 야간 조명
                대상: 어르신
                장소: 경춘선숲길
                효과: 밤길이 안전해진다
                """);

        assertThat(result).containsEntry("제목", "경춘선숲길 야간 조명")
                .containsEntry("효과", "밤길이 안전해진다");
    }

    @Test
    void 형식에_안_맞는_줄은_무시한다() {
        Map<String, String> result = AnthropicClient.parseLines("네, 정리해 드릴게요.\n제목: 공유 우산함");

        assertThat(result).hasSize(1).containsEntry("제목", "공유 우산함");
    }
}