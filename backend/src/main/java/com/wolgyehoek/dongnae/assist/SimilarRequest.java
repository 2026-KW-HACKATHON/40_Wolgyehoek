package com.wolgyehoek.dongnae.assist;

import jakarta.validation.constraints.NotBlank;

public record SimilarRequest(
        @NotBlank(message = "제목을 적어 주세요.")
        String title,
        String body
) {
}