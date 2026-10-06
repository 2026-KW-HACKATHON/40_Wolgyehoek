package com.wolgyehoek.dongnae.card;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CardRepositoryTest {

    @Autowired
    private CardRepository cardRepository;

    @Test
    void 카드를_저장하고_꺼낼_수_있다() {
        // given: 저장할 카드 준비
        String id = UUID.randomUUID().toString().substring(0,12);
        Instant now = Instant.now();
        Card card = new Card(
                id,
                "광운로 주말 플리마켓",
                "광운대 잔디밭에서 주말마다 플리마켓을 열면 좋을 듯..?",
                "월계1동 주민",
                "광운로 공터",
                "골목 상권에 사람이 많아지겠지 아마?",
                "test-device",
                "테스트 JHK주민",
                now,
                now.plus(14, ChronoUnit.DAYS)
        );

        // when: 저장하고, id로 다시 꺼내기
        cardRepository.save(card);
        Optional<Card> found = cardRepository.findById(id);

        // then: 꺼낸 카드가 있고, 제목이 같은지 확인
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("광운로 주말 플리마켓");
    }
}
