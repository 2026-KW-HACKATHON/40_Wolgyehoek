package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.card.Decision;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RecordConclusionRequest(

        @NotNull(message = "결론을 골라 주세요.")
        Decision decision,

        List<String> reasonTags,

        @Size(max = 500, message = "사유는 500자 이하로 적어 주세요.")
        String reason
) {
}