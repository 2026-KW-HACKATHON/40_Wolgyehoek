package com.wolgyehoek.dongnae.moderation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FlagRequest(
        @NotBlank(message = "신고 사유를 적어 주세요.")
        @Size(min = 2, max = 300, message = "신고 사유는 2자 이상 300자 이하로 적어 주세요.")
        String reason
) {
}