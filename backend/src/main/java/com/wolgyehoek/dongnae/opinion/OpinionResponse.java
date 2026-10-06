package com.wolgyehoek.dongnae.opinion;

import java.time.Instant;

public record OpinionResponse(
        String id,
        Stance stance,
        String stanceLabel,
        String body,
        String condition,
        String authorName,
        Instant createdAt
) {

    public static OpinionResponse from(Opinion opinion) {
        return new OpinionResponse(
                opinion.getId(),
                opinion.getStance(),
                opinion.getStance().getLabel(),
                opinion.getBody(),
                opinion.getCondition(),
                opinion.getAuthorName(),
                opinion.getCreatedAt()
        );
    }
}