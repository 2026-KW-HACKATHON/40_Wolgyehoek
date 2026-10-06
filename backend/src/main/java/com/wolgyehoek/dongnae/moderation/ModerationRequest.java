package com.wolgyehoek.dongnae.moderation;

import jakarta.validation.constraints.Size;

public record ModerationRequest(
        @Size(max = 300, message = "처리 메모는 300자 이하로 적어 주세요.")
        String note
) {
}