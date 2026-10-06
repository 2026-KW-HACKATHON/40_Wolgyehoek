package com.wolgyehoek.dongnae.opinion;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class OpinionRepositoryTest {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private OpinionRepository opinionRepository;

    @Test
    void 같은_기기가_한_카드에_의견을_여러_개_남길_수_있다() {
        Card card = saveCard();
        opinionRepository.save(opinion(card, "d_0000000000000011", Stance.PRO, "좋아요"));
        opinionRepository.save(opinion(card, "d_0000000000000011", Stance.CON, "다시 생각해보니 걱정돼요"));

        assertThat(opinionRepository.findByCardId(card.getId())).hasSize(2);
    }

    @Test
    void 의견_목록은_최신순이다() {
        Card card = saveCard();
        Opinion first = opinionRepository.save(opinion(card, "d_0000000000000012", Stance.PRO, "첫 번째 의견"));
        Opinion second = opinionRepository.save(opinion(card, "d_0000000000000013", Stance.CON, "두 번째 의견"));
        Opinion third = opinionRepository.save(opinion(card, "d_0000000000000014", Stance.PRO, "세 번째 의견"));

        List<Opinion> found = opinionRepository.findByCardIdAndHiddenFalseOrderByCreatedAtDesc(card.getId());

        assertThat(found).extracting(Opinion::getId)
                .containsExactly(third.getId(), second.getId(), first.getId());
    }

    @Test
    void 없는_카드에는_의견을_남길_수_없다() {
        Opinion opinion = new Opinion(newId(), "no-such-card", "d_0000000000000015", "테스트 주민",
                Stance.PRO, "없는 카드 의견", "");

        assertThatThrownBy(() -> opinionRepository.save(opinion))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Opinion opinion(Card card, String deviceId, Stance stance, String body) {
        return new Opinion(newId(), card.getId(), deviceId, "테스트 주민", stance, body, "");
    }

    private Card saveCard() {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), "의견 테스트 카드", "의견 테스트용 카드입니다.",
                "", "", "", "test-device", "테스트 주민", now, now.plus(14, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}