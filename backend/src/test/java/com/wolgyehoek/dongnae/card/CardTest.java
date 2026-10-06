package com.wolgyehoek.dongnae.card;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

class CardTest {

    private static final Instant NOW = Instant.parse("2026-09-27T03:00:00Z");

    @Test
    void 기간_중인_카드의_상태는_검증_중이다() {
        Card card = card(NOW.plus(7, ChronoUnit.DAYS));

        assertThat(card.status(NOW)).isEqualTo(CardStatus.OPEN);
    }

    @Test
    void 기간이_끝난_카드의_상태는_검증_종료다() {
        Card card = card(NOW.minus(1, ChronoUnit.DAYS));

        assertThat(card.status(NOW)).isEqualTo(CardStatus.CLOSED);
    }

    @Test
    void 제안자인지_확인할_수_있다() {
        Card card = card(NOW);

        assertThat(card.isProposedBy("d_proposer")).isTrue();
        assertThat(card.isProposedBy("d_someone_else")).isFalse();
    }

    @Test
    void 리포트를_공개하면_요약과_공개_시각이_저장된다() {
        Card card = card(NOW.minus(1, ChronoUnit.DAYS));
        assertThat(card.isReportPublished()).isFalse();

        card.publishReport("운영 주체가 있으면 해볼 만하다는 의견이 많았어요.", NOW);

        assertThat(card.isReportPublished()).isTrue();
        assertThat(card.getReportSummary()).isEqualTo("운영 주체가 있으면 해볼 만하다는 의견이 많았어요.");
        assertThat(card.getReportPublishedAt()).isEqualTo(NOW);
    }

    @Test
    void 결론을_기록하면_상태가_결론을_따른다() {
        Card card = card(NOW.minus(1, ChronoUnit.DAYS));
        assertThat(card.status(NOW)).isEqualTo(CardStatus.CLOSED);

        card.conclude(Decision.HOLD);

        assertThat(card.status(NOW)).isEqualTo(CardStatus.HOLD);
        assertThat(card.status(NOW).canTakeOver()).isTrue();
    }

    @Test
    void 제안자와_운영자만_관리할_수_있다() {
        Instant now = Instant.now();
        Card card = new Card("c1", "제목", "본문입니다.", "", "", "", "d_owner", "주민",
                now, now.plus(14, ChronoUnit.DAYS));

        assertThat(card.canBeManagedBy("d_owner", false)).isTrue();
        assertThat(card.canBeManagedBy("d_other", true)).isTrue();
        assertThat(card.canBeManagedBy("d_other", false)).isFalse();
    }

    private Card card(Instant endsAt) {
        return new Card("card-id", "테스트 카드", "테스트용 카드 내용입니다.", "", "", "",
                "d_proposer", "테스트 주민", endsAt.minus(14, ChronoUnit.DAYS), endsAt);
    }
}