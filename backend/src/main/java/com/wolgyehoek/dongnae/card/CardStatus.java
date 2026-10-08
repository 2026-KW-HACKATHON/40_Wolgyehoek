package com.wolgyehoek.dongnae.card;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public enum CardStatus {

    OPEN("검증 중"),
    CLOSED("검증 종료"),
    GO("진행"),
    HOLD("보류"),
    STOP("중단"),
    STALE("정체");

    public static final int STALE_DAYS = 28;

    private final String label;

    CardStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static CardStatus of(Instant endsAt, Decision latestDecision, Instant now) {
        if (latestDecision != null) {
            return switch (latestDecision) {
                case GO -> GO;
                case HOLD -> HOLD;
                case STOP -> STOP;
            };
        }
        if (now.isBefore(endsAt)) {
            return OPEN;
        }
        Instant staleAt = endsAt.plus(STALE_DAYS, ChronoUnit.DAYS);
        if (!now.isBefore(staleAt)) {
            return STALE;
        }
        return CLOSED;
    }

    public boolean canTakeOver() {
        return this == HOLD || this == STOP || this == STALE;
    }
}