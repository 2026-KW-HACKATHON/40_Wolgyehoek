package com.wolgyehoek.dongnae.reaction;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ReactionServiceTest {

    @Autowired
    private ReactionService reactionService;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CardRepository cardRepository;

    @Test
    void 처음_반응하면_저장된다() {
        Card card = saveOpenCard();

        ReactionResponse response = reactionService.react(card.getId(), "d_1000000000000001",
                new ReactRequest(2, null, "resident", true));

        assertThat(response.step()).isEqualTo(2);
        assertThat(response.price()).isNull();
        assertThat(reactionRepository.countByCardId(card.getId())).isEqualTo(1);
    }

    @Test
    void 같은_기기가_다시_반응하면_새로_만들지_않고_수정한다() {
        Card card = saveOpenCard();
        reactionService.react(card.getId(), "d_1000000000000002", new ReactRequest(1, null, "resident", null));

        ReactionResponse updated = reactionService.react(card.getId(), "d_1000000000000002",
                new ReactRequest(3, 15000, "visitor", false));

        assertThat(updated.step()).isEqualTo(3);
        assertThat(updated.price()).isEqualTo(15000);
        assertThat(reactionRepository.countByCardId(card.getId())).isEqualTo(1);
    }

    @Test
    void 가격_단계인데_가격이_없으면_거부한다() {
        Card card = saveOpenCard();

        assertThatThrownBy(() -> reactionService.react(card.getId(), "d_1000000000000003",
                new ReactRequest(3, null, "resident", null)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 가격_단계가_아니면_가격은_저장하지_않는다() {
        Card card = saveOpenCard();

        ReactionResponse response = reactionService.react(card.getId(), "d_1000000000000004",
                new ReactRequest(2, 9000, "resident", null));

        assertThat(response.price()).isNull();
    }

    @Test
    void 기간이_끝난_카드에는_반응할_수_없다() {
        Instant now = Instant.now();
        Card closed = cardRepository.save(new Card(newId(), "끝난 카드", "기간이 끝난 테스트 카드입니다.",
                "", "", "", "test-device", "테스트 주민",
                now.minus(21, ChronoUnit.DAYS), now.minus(7, ChronoUnit.DAYS)));

        assertThatThrownBy(() -> reactionService.react(closed.getId(), "d_1000000000000005",
                new ReactRequest(1, null, "resident", null)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 없는_카드에_반응하면_예외가_발생한다() {
        assertThatThrownBy(() -> reactionService.react("no-such-card", "d_1000000000000006",
                new ReactRequest(1, null, "resident", null)))
                .isInstanceOf(CardNotFoundException.class);
    }

    private Card saveOpenCard() {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), "테스트 카드", "반응 서비스 테스트용 카드입니다.",
                "", "", "", "test-device", "테스트 주민", now, now.plus(14, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}