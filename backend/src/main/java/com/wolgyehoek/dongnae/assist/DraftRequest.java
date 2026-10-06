package com.wolgyehoek.dongnae.assist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DraftRequest(
        @NotBlank(message = "아이디어를 적어 주세요.")
        @Size(max = 2000, message = "아이디어는 2000자 이하로 적어 주세요.")
        String text
) {
}