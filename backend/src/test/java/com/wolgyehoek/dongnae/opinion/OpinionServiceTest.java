package com.wolgyehoek.dongnae.opinion;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class OpinionServiceTest {

    private static final DeviceInfo AUTHOR = new DeviceInfo("d_eeeeeeeeeeeeee01", "주민 EE01", false);

    @Autowired
    private OpinionService opinionService;

    @Autowired
    private CardRepository cardRepository;

    @Test
    void 조건부_찬성은_조건과_함께_저장된다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));

        OpinionResponse response = opinionService.create(card.getId(), AUTHOR,
                new CreateOpinionRequest(Stance.CONDITIONAL, "  운영자가 있으면 좋아요  ", "  주말 운영  "));

        assertThat(response.body()).isEqualTo("운영자가 있으면 좋아요");
        assertThat(response.condition()).isEqualTo("주말 운영");
        assertThat(response.authorName()).isEqualTo("주민 EE01");
    }

    @Test
    void 조건부_찬성인데_조건이_없으면_거부한다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));

        assertThatThrownBy(() -> opinionService.create(card.getId(), AUTHOR,
                new CreateOpinionRequest(Stance.CONDITIONAL, "조건은 비웠어요", "   ")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 찬성에_보낸_조건은_저장하지_않는다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));

        OpinionResponse response = opinionService.create(card.getId(), AUTHOR,
                new CreateOpinionRequest(Stance.PRO, "무조건 찬성", "필요 없는 조건"));

        assertThat(response.condition()).isEqualTo("");
    }

    @Test
    void 기간이_끝난_시도에도_의견을_남길_수_있다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        OpinionResponse response = opinionService.create(card.getId(), AUTHOR,
                new CreateOpinionRequest(Stance.CON, "운영 주체가 없어 멈췄어요", null));

        assertThat(response.body()).isEqualTo("운영 주체가 없어 멈췄어요");
        assertThat(opinionService.list(card.getId())).hasSize(1);
    }

    @Test
    void 없는_카드의_목록은_404다() {
        assertThatThrownBy(() -> opinionService.list("no-such-card"))
                .isInstanceOf(CardNotFoundException.class);
    }

    @Test
    void 목록은_최신순이다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));
        opinionService.create(card.getId(), AUTHOR, new CreateOpinionRequest(Stance.PRO, "첫 번째", null));
        opinionService.create(card.getId(), AUTHOR, new CreateOpinionRequest(Stance.CON, "두 번째", null));

        List<OpinionResponse> list = opinionService.list(card.getId());

        assertThat(list).extracting(OpinionResponse::body).containsExactly("두 번째", "첫 번째");
    }

    @Test
    void 가려진_카드의_의견은_볼_수도_남길_수도_없다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));
        card.hide();
        cardRepository.save(card);

        assertThatThrownBy(() -> opinionService.list(card.getId()))
                .isInstanceOf(CardNotFoundException.class);
        assertThatThrownBy(() -> opinionService.create(card.getId(), AUTHOR,
                new CreateOpinionRequest(Stance.PRO, "가려진 카드에 의견", null)))
                .isInstanceOf(CardNotFoundException.class);
    }

    private Card saveCard(Instant endsAt) {
        return cardRepository.save(new Card(newId(), "의견 서비스 테스트", "의견 서비스 테스트용 카드입니다.",
                "", "", "", "test-device", "테스트 주민", endsAt.minus(14, ChronoUnit.DAYS), endsAt));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}