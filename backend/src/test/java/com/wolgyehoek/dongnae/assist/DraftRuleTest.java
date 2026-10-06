package com.wolgyehoek.dongnae.assist;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DraftRuleTest {

    @Test
    void 요청_어미와_조사를_떼어_제목을_만든다() {
        assertThat(DraftRule.toTitle("광운대 정문 앞에 공유 우산함이 있으면 좋겠어요"))
                .isEqualTo("광운대 정문 앞에 공유 우산함");
        assertThat(DraftRule.toTitle("경춘선숲길 월계 구간에 가로등이 필요해요"))
                .isEqualTo("경춘선숲길 월계 구간에 가로등");
    }

    @Test
    void 장소_대상_효과를_키워드로_찾는다() {
        DraftResponse draft = DraftRule.fromText("경춘선숲길이 밤에 너무 어두워요. 어르신들이 산책하기 무서워해요.");

        assertThat(draft.place()).isEqualTo("경춘선숲길");
        assertThat(draft.target()).isEqualTo("어르신");
        assertThat(draft.effect()).isEqualTo("밤길 안전이 좋아진다");
        assertThat(draft.source()).isEqualTo(DraftSource.RULE);
    }

    @Test
    void 키워드가_없으면_기본값을_쓴다() {
        DraftResponse draft = DraftRule.fromText("뭔가 재미있는 걸 하고 싶어요");

        assertThat(draft.place()).isEqualTo("월계1동");
        assertThat(draft.target()).isEqualTo("월계1동 주민");
    }
}