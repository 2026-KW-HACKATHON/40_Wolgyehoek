package com.wolgyehoek.dongnae.opinion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOpinionRequest(

        @NotNull(message = "입장을 골라 주세요.")
        Stance stance,

        @NotBlank(message = "의견을 적어 주세요.")
        @Size(min = 2, max = 500, message = "의견은 2자 이상 500자 이하로 적어 주세요.")
        String body,

        @Size(max = 200, message = "조건은 200자 이하로 적어 주세요.")
        String condition
) {
}