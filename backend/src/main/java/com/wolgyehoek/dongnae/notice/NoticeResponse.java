package com.wolgyehoek.dongnae.notice;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardStatus;

import java.time.Instant;

public record NoticeResponse(
        String id,
        NoticeKind kind,
        String kindLabel,
        String cardId,
        String cardTitle,
        CardStatus cardStatus,
        String cardStatusLabel,
        boolean read,
        Instant createdAt,
        Instant readAt
) {

    public static NoticeResponse of(Notice notice, Card card, Instant now) {
        CardStatus status = card.status(now);
        return new NoticeResponse(
                notice.getId(),
                notice.getKind(),
                notice.getKind().getLabel(),
                card.getId(),
                card.getTitle(),
                status,
                status.getLabel(),
                notice.getReadAt() != null,
                notice.getCreatedAt(),
                notice.getReadAt()
        );
    }
}