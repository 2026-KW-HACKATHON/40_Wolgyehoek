package com.wolgyehoek.dongnae.assist;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SimilarityTest {

    @Test
    void 공백과_문장부호를_지우고_두_글자씩_쪼갠다() {
        assertThat(Similarity.bigrams("주말, 플리마켓!"))
                .containsExactlyInAnyOrder("주말", "말플", "플리", "리마", "마켓");
    }

    @Test
    void 비슷한_아이디어는_기준_이상이고_다른_아이디어는_0에_가깝다() {
        var a = Similarity.bigrams("광운로 주말 플리마켓 광운로 공터에서 주말마다 플리마켓을 열어요");
        var b = Similarity.bigrams("광운대 앞 주말 플리마켓 광운대 앞에서 주말 플리마켓을 하면 좋겠어요");
        var c = Similarity.bigrams("경춘선숲길 가로등 밤길이 어두워요");

        assertThat(Similarity.jaccard(a, b)).isGreaterThanOrEqualTo(Similarity.THRESHOLD);
        assertThat(Similarity.jaccard(a, c)).isLessThan(Similarity.THRESHOLD);
    }

    @Test
    void 빈_글은_0이다() {
        assertThat(Similarity.jaccard(Similarity.bigrams(""), Similarity.bigrams("플리마켓"))).isEqualTo(0);
    }
}