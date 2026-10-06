package com.wolgyehoek.dongnae.takeover;

import com.wolgyehoek.dongnae.card.CreateCardRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TakeoverRequest(

        @NotNull(message = "새 카드 내용을 적어 주세요.")
        @Valid
        CreateCardRequest card,

        @NotBlank(message = "멈춘 사유에 대해 무엇이 달라졌는지 적어 주세요.")
        @Size(min = 5, max = 500, message = "무엇이 달라졌는지 5자 이상 500자 이하로 적어 주세요.")
        String takeoverNote
) {
}