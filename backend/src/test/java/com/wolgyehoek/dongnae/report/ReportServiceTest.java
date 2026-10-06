package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
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
class ReportServiceTest {

    private static final DeviceInfo PROPOSER = new DeviceInfo("d_aaaaaaaaaaaaaaa1", "주민 AAA1", false);
    private static final DeviceInfo OTHER = new DeviceInfo("d_bbbbbbbbbbbbbbb2", "주민 BBB2", false);
    private static final DeviceInfo OPERATOR = new DeviceInfo("d_ccccccccccccccc3", "동네서랍 운영", true);

    @Autowired
    private ReportService reportService;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Test
    void 검증_중에는_인원과_내_반응은_보이고_리포트는_숨긴다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));
        saveReaction(card, OTHER.id(), 2);
        saveReaction(card, "d_ddddddddddddddd4", 4);

        ReportViewResponse view = reportService.view(card.getId(), OTHER);

        assertThat(view.status()).isEqualTo(CardStatus.OPEN);
        assertThat(view.stepCounts()).containsExactly(0, 1, 0, 1);
        assertThat(view.myReaction().step()).isEqualTo(2);
        assertThat(view.canManage()).isFalse();
        assertThat(view.report()).isNull();
    }

    @Test
    void 끝난_카드는_제안자에게_공개_전에도_보인다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        ReportViewResponse view = reportService.view(card.getId(), PROPOSER);

        assertThat(view.canManage()).isTrue();
        assertThat(view.report()).isNotNull();
        assertThat(view.report().published()).isFalse();
    }

    @Test
    void 끝난_카드는_다른_사람에게_공개_후에만_보인다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));
        assertThat(reportService.view(card.getId(), OTHER).report()).isNull();

        reportService.publish(card.getId(), PROPOSER, new PublishReportRequest("  해볼 만하다는 의견이 많았어요.  "));

        ReportViewResponse view = reportService.view(card.getId(), OTHER);
        assertThat(view.report()).isNotNull();
        assertThat(view.report().published()).isTrue();
        assertThat(view.report().summary()).isEqualTo("해볼 만하다는 의견이 많았어요.");
    }

    @Test
    void 제안자가_아니면_공개할_수_없다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        assertThatThrownBy(() -> reportService.publish(card.getId(), OTHER, new PublishReportRequest(null)))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void 운영자는_공개할_수_있다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        ReportResponse report = reportService.publish(card.getId(), OPERATOR, new PublishReportRequest(null));

        assertThat(report.published()).isTrue();
    }

    @Test
    void 검증_중에는_공개할_수_없다() {
        Card card = saveCard(Instant.now().plus(7, ChronoUnit.DAYS));

        assertThatThrownBy(() -> reportService.publish(card.getId(), PROPOSER, new PublishReportRequest(null)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void 공백만_있는_요약은_null로_저장된다() {
        Card card = saveCard(Instant.now().minus(1, ChronoUnit.DAYS));

        ReportResponse report = reportService.publish(card.getId(), PROPOSER, new PublishReportRequest("   "));

        assertThat(report.published()).isTrue();
        assertThat(report.summary()).isNull();
    }

    private Card saveCard(Instant endsAt) {
        return cardRepository.save(new Card(newId(), "리포트 테스트 카드", "리포트 서비스 테스트용 카드입니다.",
                "", "", "", PROPOSER.id(), PROPOSER.nickname(), endsAt.minus(14, ChronoUnit.DAYS), endsAt));
    }

    private void saveReaction(Card card, String deviceId, int step) {
        reactionRepository.save(new Reaction(newId(), card.getId(), deviceId, step, null, "resident", null));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}