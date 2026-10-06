package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.reaction.Reaction;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

import com.wolgyehoek.dongnae.opinion.Opinion;
import com.wolgyehoek.dongnae.opinion.Stance;

class ReportCalculatorTest {

    @Test
    void 다섯_명_미만이면_비율을_숨긴다() {
        List<Reaction> reactions = List.of(
                reaction(1, null, "resident", null),
                reaction(2, null, "resident", null),
                reaction(2, null, "visitor", null),
                reaction(4, null, "resident", null)
        );

        ReactionSummary summary = ReportCalculator.summarize(reactions);

        assertThat(summary.total()).isEqualTo(4);
        assertThat(summary.showRatio()).isFalse();
        assertThat(summary.steps().get(1).count()).isEqualTo(2);
        assertThat(summary.steps().get(1).ratio()).isNull();
    }

    @Test
    void 다섯_명_이상이면_비율과_가격_통계를_계산한다() {
        List<Reaction> reactions = List.of(
                reaction(1, null, "resident", null),
                reaction(2, null, "work_study", true),
                reaction(3, 5000, "resident", true),
                reaction(3, 3000, "visitor", false),
                reaction(4, null, "resident", null)
        );

        ReactionSummary summary = ReportCalculator.summarize(reactions);

        assertThat(summary.showRatio()).isTrue();
        assertThat(summary.steps().get(2).count()).isEqualTo(2);
        assertThat(summary.steps().get(2).ratio()).isEqualTo(0.4);
        assertThat(summary.atLeast().get(1).count()).isEqualTo(4);
        assertThat(summary.price().count()).isEqualTo(2);
        assertThat(summary.price().median()).isEqualTo(4000);
        assertThat(summary.price().min()).isEqualTo(3000);
        assertThat(summary.price().max()).isEqualTo(5000);
        assertThat(summary.respondents().resident()).isEqualTo(3);
        assertThat(summary.respondents().workStudy()).isEqualTo(1);
        assertThat(summary.respondents().visitor()).isEqualTo(1);
        assertThat(summary.geoInside()).isEqualTo(2);
    }

    @Test
    void 반응이_없으면_가격_통계는_비어_있다() {
        ReactionSummary summary = ReportCalculator.summarize(List.of());

        assertThat(summary.total()).isEqualTo(0);
        assertThat(summary.price().count()).isEqualTo(0);
        assertThat(summary.price().median()).isNull();
        assertThat(summary.price().min()).isNull();
    }

    @Test
    void 중앙값_홀수_개는_가운데_값이다() {
        assertThat(ReportCalculator.median(List.of(3000, 1000, 2000))).isEqualTo(2000);
    }

    @Test
    void 중앙값_짝수_개는_가운데_두_값의_평균이다() {
        assertThat(ReportCalculator.median(List.of(1000, 3000))).isEqualTo(2000);
    }

    @Test
    void 중앙값_평균이_소수면_반올림한다() {
        assertThat(ReportCalculator.median(List.of(1000, 2001))).isEqualTo(1501);
    }

    private Reaction reaction(int step, Integer price, String type, Boolean geoInside) {
        return new Reaction("r-id", "card-id", "device-id", step, price, type, geoInside);
    }

    @Test
    void 의견을_입장별로_센다() {
        List<Opinion> opinions = List.of(
                new Opinion("o1", "card-id", "d1", "주민", Stance.PRO, "좋아요", ""),
                new Opinion("o2", "card-id", "d2", "주민", Stance.PRO, "찬성해요", ""),
                new Opinion("o3", "card-id", "d3", "주민", Stance.CON, "반대해요", ""),
                new Opinion("o4", "card-id", "d4", "주민", Stance.CONDITIONAL, "조건부요", "주말만")
        );

        OpinionSummary summary = ReportCalculator.summarizeOpinions(opinions);

        assertThat(summary.pro()).isEqualTo(2);
        assertThat(summary.con()).isEqualTo(1);
        assertThat(summary.conditional()).isEqualTo(1);
    }

    @Test
    void 가려진_의견은_집계에서_빠진다() {
        Opinion hidden = new Opinion("o9", "card-id", "d9", "주민", Stance.CON, "가려질 의견", "");
        hidden.hide();
        List<Opinion> opinions = List.of(
                new Opinion("o8", "card-id", "d8", "주민", Stance.PRO, "찬성해요", ""),
                hidden
        );

        OpinionSummary summary = ReportCalculator.summarizeOpinions(opinions);

        assertThat(summary.pro()).isEqualTo(1);
        assertThat(summary.con()).isEqualTo(0);
    }
}