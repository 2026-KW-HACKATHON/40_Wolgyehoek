package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.Decision;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ConclusionRepositoryTest {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ConclusionRepository conclusionRepository;

    @Test
    void 사유_태그_배열을_저장하고_다시_읽을_수_있다() {
        Card card = saveCard();
        conclusionRepository.save(new Conclusion(newId(), card.getId(), Decision.HOLD,
                List.of("운영 주체 없음", "예산·공간 부족"), "운영할 사람을 못 찾았어요.", "d_test"));

        List<Conclusion> found = conclusionRepository.findByCardIdOrderByCreatedAtDesc(card.getId());

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getDecision()).isEqualTo(Decision.HOLD);
        assertThat(found.get(0).getReasonTags()).containsExactly("운영 주체 없음", "예산·공간 부족");
    }

    private Card saveCard() {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), "결론 테스트 카드", "결론 테스트용 카드입니다.",
                "", "", "", "test-device", "테스트 주민", now.minus(15, ChronoUnit.DAYS), now.minus(1, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}