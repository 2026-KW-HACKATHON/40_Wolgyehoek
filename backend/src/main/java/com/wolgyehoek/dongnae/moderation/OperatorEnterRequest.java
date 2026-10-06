package com.wolgyehoek.dongnae.moderation;

import jakarta.validation.constraints.NotBlank;

public record OperatorEnterRequest(
        @NotBlank(message = "운영 코드를 입력해 주세요.")
        String code
) {
}