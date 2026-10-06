package com.wolgyehoek.dongnae.reaction;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ReactionRepositoryTest {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Test
    void 카드와_기기로_반응을_찾을_수_있음() {
        Card card = saveCard();
        reactionRepository.save(new Reaction(newId(), card.getId(), "d_0000000000000001", 2, null, "resident", true));

        Optional<Reaction> found = reactionRepository.findByCardIdAndDeviceId(card.getId(), "d_0000000000000001");

        assertThat(found).isPresent();
        assertThat(found.get().getStep()).isEqualTo(2);
    }

    @Test
    void 같은_기기는_같은_카드에_반응을_두_개_남길_수_없음() {
        Card card = saveCard();
        reactionRepository.save(new Reaction(newId(), card.getId(), "d_0000000000000002", 1, null, "resident", null));

        Reaction duplicate = new Reaction(newId(), card.getId(), "d_0000000000000002", 4, null, "visitor", null);

        assertThatThrownBy(() -> reactionRepository.save(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void 없는_카드에는_반응을_남길_수_없음() {
        Reaction reaction = new Reaction(newId(), "no-such-card", "d_0000000000000003", 1, null, "resident", null);

        assertThatThrownBy(() -> reactionRepository.save(reaction))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void 반응_단계는_1에서_4_사이여야_함() {
        Card card = saveCard();
        Reaction reaction = new Reaction(newId(), card.getId(), "d_0000000000000004", 5, null, "resident", null);

        assertThatThrownBy(() -> reactionRepository.save(reaction))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Card saveCard() {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), "테스트 카드", "반응 테스트용 카드입니다.",
                "", "", "", "test-device", "테스트 주민", now, now.plus(14, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
