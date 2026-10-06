package com.wolgyehoek.dongnae.reaction;

import java.time.Instant;

public record ReactionResponse(
        int step,
        Integer price,
        String respondentType,
        Boolean geoInside,
        Instant updatedAt
) {

    public static ReactionResponse from(Reaction reaction) {
        return new ReactionResponse(
                reaction.getStep(),
                reaction.getPrice(),
                reaction.getRespondentType(),
                reaction.getGeoInside(),
                reaction.getUpdatedAt()
        );
    }
}