package com.wolgyehoek.dongnae.card;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

@SpringBootTest
class CardServiceTest {

    @Autowired
    private CardService cardService;

    @Test
    void 카드를_게시하면_입력값을_다듬고_기본_기간으로_저장() {
        // given: 제목에 공백이 있고, target-effect-weeks는 안 보낸 요청
        CreateCardRequest request = new CreateCardRequest(
                "   광운로 주말 플리마켓   ",
                "광운로 잔디밭에서 주말마다 플리마켓을 열면 좋을 듯 싶음.",
                null,
                "광운로 잔디밭",
                null,
                null
        );

        // when
        CardResponse response = cardService.create(request, "test-device", "테스트 주민");

        // then
        assertThat(response.id()).hasSize(12);
        assertThat(response.title()).isEqualTo("광운로 주말 플리마켓");
        assertThat(response.target()).isEqualTo("");
        assertThat(response.endsAt()).isEqualTo(response.startsAt().plus(14, ChronoUnit.DAYS));
    }

    @Test
    void 저장한_카드를_id로_조회할_수_있다() {
        // given
        CreateCardRequest request = new CreateCardRequest(
                "월계동 야간 산책길 조명",
                "경춘선숲길 월계 구간 밤이 너무 어두워요.",
                "월계1동 주민", "경춘선숲길", "밤길이 안전해진다", 3
        );
        CardResponse created = cardService.create(request, "test-device", "테스트 주민");

        // when
        CardResponse found = cardService.get(created.id());

        // then
        assertThat(found.title()).isEqualTo("월계동 야간 산책길 조명");
        assertThat(found.endsAt()).isEqualTo(found.startsAt().plus(21, ChronoUnit.DAYS));
    }

    @Test
    void 없는_카들를_조회하면_예외가_발생() {
        assertThatThrownBy(() -> cardService.get("no-such-id")).isInstanceOf(CardNotFoundException.class);
    }
}
