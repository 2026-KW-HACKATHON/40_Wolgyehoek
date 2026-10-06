package com.wolgyehoek.dongnae.card;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

class CardStatusTest {

    private static final Instant NOW = Instant.parse("2026-09-27T03:00:00Z");

    @Test
    void 기간_중이면_검증_중이다() {
        Instant endsAt = NOW.plus(1, ChronoUnit.DAYS);

        assertThat(CardStatus.of(endsAt, null, NOW)).isEqualTo(CardStatus.OPEN);
    }

    @Test
    void 기간이_끝나고_결론이_없으면_검증_종료다() {
        Instant endsAt = NOW.minus(1, ChronoUnit.DAYS);

        assertThat(CardStatus.of(endsAt, null, NOW)).isEqualTo(CardStatus.CLOSED);
    }

    @Test
    void 결론이_있으면_결론을_따른다() {
        Instant endsAt = NOW.minus(1, ChronoUnit.DAYS);

        assertThat(CardStatus.of(endsAt, Decision.HOLD, NOW)).isEqualTo(CardStatus.HOLD);
        assertThat(CardStatus.of(endsAt, Decision.GO, NOW)).isEqualTo(CardStatus.GO);
        assertThat(CardStatus.of(endsAt, Decision.STOP, NOW)).isEqualTo(CardStatus.STOP);
    }

    @Test
    void 종료_후_27일이면_아직_검증_종료다() {
        Instant endsAt = NOW.minus(CardStatus.STALE_DAYS - 1, ChronoUnit.DAYS);

        assertThat(CardStatus.of(endsAt, null, NOW)).isEqualTo(CardStatus.CLOSED);
    }

    @Test
    void 종료_후_정확히_28일이면_정체다() {
        Instant endsAt = NOW.minus(CardStatus.STALE_DAYS, ChronoUnit.DAYS);

        assertThat(CardStatus.of(endsAt, null, NOW)).isEqualTo(CardStatus.STALE);
    }

    @Test
    void 종료_후_29일이면_정체다() {
        Instant endsAt = NOW.minus(CardStatus.STALE_DAYS + 1, ChronoUnit.DAYS);

        assertThat(CardStatus.of(endsAt, null, NOW)).isEqualTo(CardStatus.STALE);
    }

    @Test
    void 이어받기는_보류_중단_정체만_가능하다() {
        assertThat(CardStatus.HOLD.canTakeOver()).isTrue();
        assertThat(CardStatus.STOP.canTakeOver()).isTrue();
        assertThat(CardStatus.STALE.canTakeOver()).isTrue();
        assertThat(CardStatus.OPEN.canTakeOver()).isFalse();
        assertThat(CardStatus.CLOSED.canTakeOver()).isFalse();
        assertThat(CardStatus.GO.canTakeOver()).isFalse();
    }

    @Test
    void 결론은_검증_중이_아닐_때만_남길_수_있다() {
        assertThat(CardStatus.OPEN.canConclude()).isFalse();
        assertThat(CardStatus.CLOSED.canConclude()).isTrue();
        assertThat(CardStatus.STALE.canConclude()).isTrue();
    }
}