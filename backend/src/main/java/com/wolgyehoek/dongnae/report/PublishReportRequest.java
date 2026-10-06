package com.wolgyehoek.dongnae.report;

import jakarta.validation.constraints.Size;

public record PublishReportRequest(

        @Size(max = 500, message = "의견 요약은 500자 이하로 적어 주세요.")
        String summary
) {
}