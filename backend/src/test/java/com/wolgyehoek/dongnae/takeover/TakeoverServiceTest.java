package com.wolgyehoek.dongnae.takeover;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CreateCardRequest;
import com.wolgyehoek.dongnae.card.Decision;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ConflictException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.notice.NoticeKind;
import com.wolgyehoek.dongnae.notice.NoticeRepository;
import com.wolgyehoek.dongnae.reaction.Reaction;
import com.wolgyehoek.dongnae.reaction.ReactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class TakeoverServiceTest {

    private static final DeviceInfo STUDENT = new DeviceInfo("d_9999999999999901", "학생팀", false);

    @Autowired private TakeoverService takeoverService;
    @Autowired private CardRepository cardRepository;
    @Autowired private ReactionRepository reactionRepository;
    @Autowired private NoticeRepository noticeRepository;

    @Test
    void 보류된_카드를_이어받으면_원본과_연결되고_이전_응답자에게_알림이_간다() {
        Card parent = saveStoppedCard(null, Decision.HOLD);
        saveReaction(parent, "d_8888888888888801");
        saveReaction(parent, "d_8888888888888802");
        saveReaction(parent, STUDENT.id());

        TakeoverResponse result = takeoverService.takeOver(parent.getId(), STUDENT, request());

        assertThat(result.card().parentId()).isEqualTo(parent.getId());
        assertThat(result.card().takeoverNote()).isEqualTo("학생팀이 운영을 맡기로 했어요.");
        assertThat(result.notifiedCount()).isEqualTo(2);
        assertThat(noticeRepository.findByCardId(result.card().id()))
                .hasSize(2)
                .allMatch(n -> n.getKind() == NoticeKind.TAKEOVER);
    }

    @Test
    void 검증_중인_카드는_이어받을_수_없다() {
        Instant now = Instant.now();
        Card open = cardRepository.save(new Card(newId(), "열린 카드", "아직 검증 중인 카드입니다.", "", "", "",
                "d_owner", "주민", now, now.plus(7, ChronoUnit.DAYS)));

        assertThatThrownBy(() -> takeoverService.takeOver(open.getId(), STUDENT, request()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 진행_중인_이어받기가_있으면_또_이어받을_수_없다() {
        Card parent = saveStoppedCard(null, Decision.STOP);
        takeoverService.takeOver(parent.getId(), STUDENT, request());

        assertThatThrownBy(() -> takeoverService.takeOver(parent.getId(), STUDENT, request()))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void 이어받은_카드도_다시_멈추면_원본을_또_이어받을_수_있다() {
        Card parent = saveStoppedCard(null, Decision.HOLD);
        saveStoppedCard(parent.getId(), Decision.STOP);

        TakeoverResponse result = takeoverService.takeOver(parent.getId(), STUDENT, request());

        assertThat(result.card().parentId()).isEqualTo(parent.getId());
        assertThat(takeoverService.takeovers(parent.getId())).hasSize(2);
    }

    @Test
    void 가려진_이어받기는_새로운_이어받기를_막지_않는다() {
        Card parent = saveStoppedCard(null, Decision.HOLD);
        TakeoverResponse first = takeoverService.takeOver(parent.getId(), STUDENT, request());
        Card child = cardRepository.findById(first.card().id()).orElseThrow();
        child.hide();
        cardRepository.save(child);
        TakeoverResponse second = takeoverService.takeOver(parent.getId(), STUDENT, request());
        assertThat(second.card().id()).isNotEqualTo(first.card().id());
        assertThat(takeoverService.takeovers(parent.getId())).hasSize(1);
    }

    private TakeoverRequest request() {
        return new TakeoverRequest(
                new CreateCardRequest("광운로 플리마켓 2", "학생팀이 운영하는 플리마켓을 다시 검증해요.", null, null, null, null),
                "  학생팀이 운영을 맡기로 했어요.  ");
    }

    private Card saveStoppedCard(String parentId, Decision decision) {
        Instant now = Instant.now();
        Card card = new Card(newId(), "멈춘 카드", "보류되거나 중단된 테스트 카드입니다.", "", "", "",
                "d_owner", "주민", now.minus(30, ChronoUnit.DAYS), now.minus(16, ChronoUnit.DAYS));
        if (parentId != null) {
            card.linkParent(parentId, "이전에 이어받은 카드");
        }
        card.conclude(decision);
        return cardRepository.save(card);
    }

    private void saveReaction(Card card, String deviceId) {
        reactionRepository.save(new Reaction(newId(), card.getId(), deviceId, 2, null, "resident", null));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}