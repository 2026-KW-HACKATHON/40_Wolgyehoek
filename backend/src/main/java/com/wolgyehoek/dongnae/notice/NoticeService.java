package com.wolgyehoek.dongnae.notice;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final CardRepository cardRepository;

    public NoticeService(NoticeRepository noticeRepository, CardRepository cardRepository) {
        this.noticeRepository = noticeRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<NoticeResponse> list(String deviceId) {
        List<Notice> notices = noticeRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);

        Set<String> cardIds = notices.stream()
                .map(Notice::getCardId)
                .collect(Collectors.toSet());
        Map<String, Card> cards = cardRepository.findAllById(cardIds).stream()
                .collect(Collectors.toMap(Card::getId, Function.identity()));

        Instant now = Instant.now();
        return notices.stream()
                .filter(n -> cards.containsKey(n.getCardId()) && !cards.get(n.getCardId()).isHidden())
                .map(n -> NoticeResponse.of(n, cards.get(n.getCardId()), now))
                .toList();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(String deviceId) {
        long count = list(deviceId).stream()
                .filter(n -> !n.read())
                .count();
        return new UnreadCountResponse(count);
    }

    @Transactional
    public NoticeResponse markRead(String noticeId, String deviceId) {
        Notice notice = noticeRepository.findById(noticeId)
                .filter(n -> n.getDeviceId().equals(deviceId))
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없어요: " + noticeId));

        Instant now = Instant.now();
        notice.markRead(now);

        Card card = cardRepository.findById(notice.getCardId())
                .orElseThrow(() -> new NotFoundException("카드를 찾을 수 없어요: " + notice.getCardId()));
        return NoticeResponse.of(notice, card, now);
    }
}