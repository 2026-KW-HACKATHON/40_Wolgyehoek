package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.card.Decision;

import java.time.Instant;
import java.util.List;

public record ConclusionResponse(
        String id,
        Decision decision,
        String decisionLabel,
        List<String> reasonTags,
        String reason,
        Instant createdAt
) {

    public static ConclusionResponse from(Conclusion conclusion) {
        return new ConclusionResponse(
                conclusion.getId(),
                conclusion.getDecision(),
                conclusion.getDecision().getLabel(),
                conclusion.getReasonTags(),
                conclusion.getReason(),
                conclusion.getCreatedAt()
        );
    }
}