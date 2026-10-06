package com.wolgyehoek.dongnae.reaction;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ReactRequest(

        @NotNull(message = "반응 단계를 골라 주세요.")
        @Min(value = 1, message = "반응 단계는 1~4 중에서 골라 주세요.")
        @Max(value = 4, message = "반응 단계는 1~4 중에서 골라 주세요.")
        Integer step,

        @Min(value = 0, message = "가격은 0원부터 1,000,000원 사이로 적어 주세요.")
        @Max(value = 1_000_000, message = "가격은 0원부터 1,000,000원 사이로 적어 주세요.")
        Integer price,

        @NotNull(message = "응답자 구분을 골라 주세요.")
        @Pattern(regexp = "resident|work_study|visitor", message = "응답자 구분이 올바르지 않아요.")
        String respondentType,

        Boolean geoInside
) {
}