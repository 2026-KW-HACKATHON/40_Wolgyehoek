package com.wolgyehoek.dongnae.participation;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardResponse;
import com.wolgyehoek.dongnae.opinion.Opinion;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;
import com.wolgyehoek.dongnae.opinion.Stance;
import com.wolgyehoek.dongnae.reaction.Reaction;
import com.wolgyehoek.dongnae.reaction.ReactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ParticipationServiceTest {

    @Autowired private ParticipationService participationService;
    @Autowired private CardRepository cardRepository;
    @Autowired private ReactionRepository reactionRepository;
    @Autowired private OpinionRepository opinionRepository;

    @Test
    void 제안_반응_의견한_카드가_각각_모이고_가려진_카드는_빠진다() {
        String me = "d_" + newId() + "0003";
        Card mine = saveCard(me);
        Card reacted = saveCard("d_other");
        Card opinioned = saveCard("d_other");
        Card hidden = saveCard("d_other");
        hidden.hide();
        cardRepository.save(hidden);

        reactionRepository.save(new Reaction(newId(), reacted.getId(), me, 2, null, "resident", null));
        reactionRepository.save(new Reaction(newId(), hidden.getId(), me, 1, null, "resident", null));
        opinionRepository.save(new Opinion(newId(), opinioned.getId(), me, "주민", Stance.PRO, "첫 의견", ""));
        opinionRepository.save(new Opinion(newId(), opinioned.getId(), me, "주민", Stance.CON, "두 번째 의견", ""));

        ParticipationResponse result = participationService.of(me);

        assertThat(result.proposed()).extracting(CardResponse::id).containsExactly(mine.getId());
        assertThat(result.reacted()).extracting(CardResponse::id).containsExactly(reacted.getId());
        assertThat(result.opinioned()).extracting(CardResponse::id).containsExactly(opinioned.getId());
    }

    private Card saveCard(String proposerId) {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), "참여 테스트 카드", "참여 테스트용 카드입니다.", "", "", "",
                proposerId, "주민", now, now.plus(14, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}