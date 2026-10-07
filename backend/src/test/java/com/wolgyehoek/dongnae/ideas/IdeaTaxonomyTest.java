package com.wolgyehoek.dongnae.ideas;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class IdeaTaxonomyTest {

    @Test
    void 개념과_구역을_함께_뽑고_분야가_없으면_대표_개념의_분야를_쓴다() {
        var p = IdeaTaxonomy.classify("광운대 주민 플리마켓", "", "학생과 주민이 함께 여는 장터", "광운대 동해문화예술관 광장", "");
        assertThat(p.conceptKeys()).contains("MARKET");
        assertThat(p.zone().key()).isEqualTo("KW_UNIV");
        assertThat(p.topic()).isEqualTo("COMMERCE");
    }

    @Test
    void 광운대역은_광운대_앞과_구분하고_장소가_없으면_본문에서_찾는다() {
        assertThat(IdeaTaxonomy.classify("우회길 지도", "", "", "광운대역 일대", "").zone().key()).isEqualTo("KW_STATION");
        assertThat(IdeaTaxonomy.classify("밤길 동행", "", "석계역 뒤 골목이 어두워요", "", "").zone().key()).isEqualTo("SEOKGYE");
        assertThat(IdeaTaxonomy.classify("동네 기자단", "", "소식을 알려요", "", "").zone()).isEqualTo(IdeaTaxonomy.WIDE);
    }

    @Test
    void 아이디어와_버스킹이_다른_개념으로_새지_않는다() {
        var p = IdeaTaxonomy.classify("버스킹 아이디어", "", "공연을 열어요", "", "NEIGHBOR");
        assertThat(p.conceptKeys()).contains("CULTURE").doesNotContain("TRAFFIC", "CHILD");
        assertThat(p.topic()).isEqualTo("NEIGHBOR");
    }
}
