package com.wolgyehoek.dongnae.card;

import java.time.Instant;

public record CardResponse(
        String id,
        String title,
        String body,
        String target,
        String place,
        String effect,
        String proposerName,
        Instant startsAt,
        Instant endsAt,
        Instant createdAt,
        CardStatus status,
        String statusLabel,
        String parentId,
        String takeoverNote
) {

    public static CardResponse from(Card card, Instant now) {
        CardStatus status = card.status(now);
        return new CardResponse(
                card.getId(),
                card.getTitle(),
                card.getBody(),
                card.getTarget(),
                card.getPlace(),
                card.getEffect(),
                card.getProposerName(),
                card.getStartsAt(),
                card.getEndsAt(),
                card.getCreatedAt(),
                status,
                status.getLabel(),
                card.getParentId(),
                card.getTakeoverNote()
        );
    }
}
