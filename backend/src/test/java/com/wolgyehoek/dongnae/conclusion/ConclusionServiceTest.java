package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.card.Decision;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.notice.NoticeKind;
import com.wolgyehoek.dongnae.notice.NoticeRepository;
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
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ConclusionServiceTest {

    private static final DeviceInfo PROPOSER = new DeviceInfo("d_ffffffffffffff01", "주민 FF01", false);
    private static final DeviceInfo OTHER = new DeviceInfo("d_ffffffffffffff02", "주민 FF02", false);

    @Autowired private ConclusionService conclusionService;
    @Autowired private CardRepository cardRepository;
    @Autowired private ReactionRepository reactionRepository;
    @Autowired private OpinionRepository opinionRepository;
    @Autowired private NoticeRepository noticeRepository;

    @Test
    void 결론을_기록하면_카드_상태가_바뀌고_응답자에게_한_번씩_알림이_간다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));
        saveReaction(card, "d_aaaa000000000001");
        saveReaction(card, "d_aaaa000000000002");
        saveReaction(card, PROPOSER.id());
        saveOpinion(card, "d_aaaa000000000002");
        saveOpinion(card, "d_aaaa000000000003");

        RecordConclusionResponse result = conclusionService.record(card.getId(), PROPOSER,
                new RecordConclusionRequest(Decision.HOLD, List.of("운영 주체 없음"), "운영할 사람을 못 찾았어요."));

        assertThat(result.notifiedCount()).isEqualTo(3);
        assertThat(noticeRepository.findByCardId(card.getId()))
                .hasSize(3)
                .allMatch(n -> n.getKind() == NoticeKind.CONCLUSION);
        Card reloaded = cardRepository.findById(card.getId()).orElseThrow();
        assertThat(reloaded.status(Instant.now())).isEqualTo(CardStatus.HOLD);
    }

    @Test
    void 검증_기간_중에도_결과와_멈춘_이유를_남길_수_있다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));

        conclusionService.record(card.getId(), PROPOSER,
                new RecordConclusionRequest(Decision.STOP, List.of("예산·공간 부족"), "쓸 공간을 구하지 못했어요."));

        Card reloaded = cardRepository.findById(card.getId()).orElseThrow();
        assertThat(reloaded.status(Instant.now())).isEqualTo(CardStatus.STOP);
        assertThat(conclusionService.history(card.getId()))
                .singleElement()
                .satisfies(c -> assertThat(c.reasonTags()).containsExactly("예산·공간 부족"));
    }

    @Test
    void 보류는_사유가_없으면_거부한다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        assertThatThrownBy(() -> conclusionService.record(card.getId(), PROPOSER,
                new RecordConclusionRequest(Decision.HOLD, List.of("운영 주체 없음"), "   ")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 진행은_사유_없이도_기록된다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        conclusionService.record(card.getId(), PROPOSER, new RecordConclusionRequest(Decision.GO, null, null));

        Card reloaded = cardRepository.findById(card.getId()).orElseThrow();
        assertThat(reloaded.status(Instant.now())).isEqualTo(CardStatus.GO);
    }

    @Test
    void 목록에_없는_태그는_거부한다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        assertThatThrownBy(() -> conclusionService.record(card.getId(), PROPOSER,
                new RecordConclusionRequest(Decision.STOP, List.of("귀찮음"), "그냥요")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 제안자가_아니면_기록할_수_없다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        assertThatThrownBy(() -> conclusionService.record(card.getId(), OTHER,
                new RecordConclusionRequest(Decision.GO, null, null)))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void 결론은_이력으로_쌓이고_최신_결론이_상태가_된다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));
        conclusionService.record(card.getId(), PROPOSER,
                new RecordConclusionRequest(Decision.HOLD, List.of("예산·공간 부족"), "공간이 없어요."));
        conclusionService.record(card.getId(), PROPOSER,
                new RecordConclusionRequest(Decision.GO, null, null));

        List<ConclusionResponse> history = conclusionService.history(card.getId());

        assertThat(history).extracting(ConclusionResponse::decision)
                .containsExactly(Decision.GO, Decision.HOLD);
        Card reloaded = cardRepository.findById(card.getId()).orElseThrow();
        assertThat(reloaded.status(Instant.now())).isEqualTo(CardStatus.GO);
    }

    private Card saveCard(Instant endsAt) {
        return cardRepository.save(new Card(newId(), "결론 서비스 테스트", "결론 서비스 테스트용 카드입니다.",
                "", "", "", PROPOSER.id(), PROPOSER.nickname(), endsAt.minus(14, ChronoUnit.DAYS), endsAt));
    }

    private void saveReaction(Card card, String deviceId) {
        reactionRepository.save(new Reaction(newId(), card.getId(), deviceId, 2, null, "resident", null));
    }

    private void saveOpinion(Card card, String deviceId) {
        opinionRepository.save(new Opinion(newId(), card.getId(), deviceId, "주민", Stance.PRO, "좋아요", ""));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}