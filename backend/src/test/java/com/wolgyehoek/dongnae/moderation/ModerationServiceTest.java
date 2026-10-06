package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardService;
import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.common.ConflictException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.opinion.Opinion;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;
import com.wolgyehoek.dongnae.opinion.OpinionService;
import com.wolgyehoek.dongnae.opinion.Stance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ModerationServiceTest {

    private static final DeviceInfo RESIDENT_1 = new DeviceInfo("d_7777777777777701", "주민 7701", false);
    private static final DeviceInfo RESIDENT_2 = new DeviceInfo("d_7777777777777702", "주민 7702", false);
    private static final DeviceInfo OPERATOR = new DeviceInfo("d_7777777777777799", "운영자", true);

    @Autowired private FlagService flagService;
    @Autowired private ModerationService moderationService;
    @Autowired private FlagRepository flagRepository;
    @Autowired private CardRepository cardRepository;
    @Autowired private CardService cardService;
    @Autowired private OpinionRepository opinionRepository;
    @Autowired private OpinionService opinionService;

    @Test
    void 같은_기기는_같은_글을_두_번_신고할_수_없다() {
        Card card = saveCard();
        flagService.flagCard(card.getId(), RESIDENT_1, "광고 글이에요");

        assertThatThrownBy(() -> flagService.flagCard(card.getId(), RESIDENT_1, "또 신고"))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void 운영자가_아니면_신고를_처리할_수_없다() {
        Card card = saveCard();
        FlagResponse flag = flagService.flagCard(card.getId(), RESIDENT_1, "광고 글이에요");

        assertThatThrownBy(() -> moderationService.hide(flag.id(), RESIDENT_2, null))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void 의견을_가리면_같은_대상의_신고가_모두_처리되고_목록에서_빠진다() {
        Card card = saveCard();
        Opinion opinion = opinionRepository.save(new Opinion(newId(), card.getId(), "d_writer", "주민",
                Stance.CON, "부적절한 의견", ""));
        FlagResponse first = flagService.flagOpinion(opinion.getId(), RESIDENT_1, "욕설이 있어요");
        FlagResponse second = flagService.flagOpinion(opinion.getId(), RESIDENT_2, "불쾌해요");

        FlagResponse result = moderationService.hide(first.id(), OPERATOR, "  욕설 확인  ");

        assertThat(result.status()).isEqualTo(FlagStatus.HIDDEN);
        assertThat(result.note()).isEqualTo("욕설 확인");
        assertThat(flagRepository.findById(second.id()).orElseThrow().getStatus()).isEqualTo(FlagStatus.HIDDEN);
        assertThat(opinionService.list(card.getId())).isEmpty();
    }

    @Test
    void 유지하면_대상은_그대로다() {
        Card card = saveCard();
        FlagResponse flag = flagService.flagCard(card.getId(), RESIDENT_1, "애매한 글");

        moderationService.keep(flag.id(), OPERATOR, null);

        assertThat(cardRepository.findById(card.getId()).orElseThrow().isHidden()).isFalse();
        assertThat(flagRepository.findById(flag.id()).orElseThrow().getStatus()).isEqualTo(FlagStatus.KEPT);
    }

    @Test
    void 가린_카드는_목록에서_빠지고_운영자만_상세를_본다() {
        Card card = saveCard();
        FlagResponse flag = flagService.flagCard(card.getId(), RESIDENT_1, "광고 글이에요");

        moderationService.hide(flag.id(), OPERATOR, null);

        assertThat(cardService.getAll()).extracting(c -> c.id()).doesNotContain(card.getId());
        assertThatThrownBy(() -> cardService.get(card.getId(), false))
                .isInstanceOf(CardNotFoundException.class);
        assertThat(cardService.get(card.getId(), true).id()).isEqualTo(card.getId());
    }

    @Test
    void 즉시_종료하면_검증_종료가_된다() {
        Card card = saveCard();

        moderationService.closeNow(card.getId(), OPERATOR);

        Card reloaded = cardRepository.findById(card.getId()).orElseThrow();
        assertThat(reloaded.status(Instant.now())).isEqualTo(CardStatus.CLOSED);
    }

    private Card saveCard() {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), "신고 테스트 카드", "신고 테스트용 카드입니다.",
                "", "", "", "d_owner", "주민", now, now.plus(14, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}