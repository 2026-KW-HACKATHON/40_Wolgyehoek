package com.wolgyehoek.dongnae.card;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateCardRequest(
        @NotBlank(message = "제목을 적어 주세요!")
        @Size(min = 2, max = 60, message = "제목은 2자 이상, 60자 이하로 적어 주세요!")
        String title,

        @NotBlank(message = "아이디어 내용을 적어 주세요!")
        @Size(min = 10, max = 2000, message = "아이디어를 10자, 이상 2000자 이하로 적어 주세요!")
        String body,

        @Size(max = 100, message = "대상은 100자 이하로 적어 주세요!")
        String target,

        @Size(max = 100, message = "장소는 100자 이하로 적어 주세요!")
        String place,

        @Size(max = 200, message = "기대 효과는 200자 이하로 적어 주세요!")
        String effect,

        @Min(value = 1, message = "검증 기간은 1주 이상이어야 해요..!")
        @Max(value = 8, message = "검증 기간은 8주 이하여야 해요..!")
        Integer weeks,

        @Size(max = 4, message = "사진·영상은 4개까지 올릴 수 있어요.")
        List<String> mediaIds,

        @Min(value = 2, message = "목표 인원은 2명 이상이어야 해요.")
        @Max(value = 1000, message = "목표 인원은 1,000명 이하여야 해요.")
        Integer goal
) {
    public CreateCardRequest(String title, String body, String target, String place, String effect, Integer weeks) {
        this(title, body, target, place, effect, weeks, List.of(), null);
    }

    public CreateCardRequest(String title, String body, String target, String place, String effect, Integer weeks, List<String> mediaIds) {
        this(title, body, target, place, effect, weeks, mediaIds, null);
    }
}
