package com.wolgyehoek.dongnae.moderation;

import java.time.Instant;

public record FlagResponse(
        String id,
        FlagTargetType targetType,
        String targetId,
        String reason,
        FlagStatus status,
        String note,
        Instant createdAt,
        Instant handledAt
) {

    public static FlagResponse from(Flag flag) {
        return new FlagResponse(
                flag.getId(), flag.getTargetType(), flag.getTargetId(), flag.getReason(),
                flag.getStatus(), flag.getNote(), flag.getCreatedAt(), flag.getHandledAt());
    }
}