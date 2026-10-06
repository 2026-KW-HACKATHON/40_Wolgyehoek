package com.wolgyehoek.dongnae.notice;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.NotFoundException;
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
class NoticeServiceTest {

    @Autowired private NoticeService noticeService;
    @Autowired private NoticeRepository noticeRepository;
    @Autowired private CardRepository cardRepository;

    @Test
    void 내_알림만_최신순으로_카드_제목과_함께_보인다() {
        String me = "d_" + newId().substring(0, 12) + "0001";
        Card card = saveCard("알림 테스트 카드");
        Notice older = noticeRepository.save(new Notice(newId(), me, card.getId(), NoticeKind.CONCLUSION));
        Notice newer = noticeRepository.save(new Notice(newId(), me, card.getId(), NoticeKind.TAKEOVER));
        noticeRepository.save(new Notice(newId(), "d_someone_else", card.getId(), NoticeKind.CONCLUSION));

        List<NoticeResponse> list = noticeService.list(me);

        assertThat(list).extracting(NoticeResponse::id).containsExactly(newer.getId(), older.getId());
        assertThat(list.get(0).cardTitle()).isEqualTo("알림 테스트 카드");
        assertThat(list.get(0).read()).isFalse();
    }

    @Test
    void 읽으면_안_읽은_수가_줄고_다시_읽어도_처음_시각이_유지된다() {
        String me = "d_" + newId().substring(0, 12) + "0002";
        Card card = saveCard("읽음 테스트 카드");
        Notice notice = noticeRepository.save(new Notice(newId(), me, card.getId(), NoticeKind.CONCLUSION));
        noticeRepository.save(new Notice(newId(), me, card.getId(), NoticeKind.TAKEOVER));
        assertThat(noticeService.unreadCount(me).count()).isEqualTo(2);

        NoticeResponse first = noticeService.markRead(notice.getId(), me);
        NoticeResponse second = noticeService.markRead(notice.getId(), me);

        assertThat(first.read()).isTrue();
        assertThat(second.readAt()).isEqualTo(first.readAt());
        assertThat(noticeService.unreadCount(me).count()).isEqualTo(1);
    }

    @Test
    void 남의_알림은_읽을_수_없다() {
        Card card = saveCard("남의 알림 카드");
        Notice notice = noticeRepository.save(new Notice(newId(), "d_owner_of_notice", card.getId(), NoticeKind.CONCLUSION));

        assertThatThrownBy(() -> noticeService.markRead(notice.getId(), "d_not_owner"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void 가려진_카드의_알림은_읽음_API로도_노출되지_않는다() {
        Card card = saveCard("가려진 카드");
        Notice notice = noticeRepository.save(new Notice(newId(), "d_hidden_notice", card.getId(), NoticeKind.CONCLUSION));
        card.hide();
        cardRepository.save(card);
        assertThat(noticeService.list("d_hidden_notice")).isEmpty();
        assertThatThrownBy(() -> noticeService.markRead(notice.getId(), "d_hidden_notice"))
                .isInstanceOf(NotFoundException.class);
        assertThat(noticeRepository.findById(notice.getId()).orElseThrow().getReadAt()).isNull();
    }

    private Card saveCard(String title) {
        Instant now = Instant.now();
        return cardRepository.save(new Card(newId(), title, "알림 테스트용 카드입니다.", "", "", "",
                "d_owner", "주민", now, now.plus(14, ChronoUnit.DAYS)));
    }

    private String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}