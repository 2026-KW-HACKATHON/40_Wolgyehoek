package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.card.Card;

import java.time.Instant;

public record ReportResponse(
        ReactionSummary reactions,
        OpinionSummary opinions,
        String summary,
        boolean published,
        Instant publishedAt,
        String disclaimer
) {

    public static final String DISCLAIMER = "비공식 의견 조사로, 공식 결정이 아니며 대표성을 보장하지 않음";

    public static ReportResponse of(ReactionSummary reactions, OpinionSummary opinions, Card card) {
        return new ReportResponse(
                reactions,
                opinions,
                card.getReportSummary(),
                card.isReportPublished(),
                card.getReportPublishedAt(),
                DISCLAIMER
        );
    }
}