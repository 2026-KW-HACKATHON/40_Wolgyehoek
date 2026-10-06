package com.wolgyehoek.dongnae.takeover;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardResponse;
import com.wolgyehoek.dongnae.card.CardService;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ConflictException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.notice.Notice;
import com.wolgyehoek.dongnae.notice.NoticeKind;
import com.wolgyehoek.dongnae.notice.NoticeRepository;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;
import com.wolgyehoek.dongnae.reaction.ReactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TakeoverService {

    private final CardRepository cardRepository;
    private final CardService cardService;
    private final ReactionRepository reactionRepository;
    private final OpinionRepository opinionRepository;
    private final NoticeRepository noticeRepository;

    public TakeoverService(CardRepository cardRepository, CardService cardService,
                           ReactionRepository reactionRepository, OpinionRepository opinionRepository,
                           NoticeRepository noticeRepository) {
        this.cardRepository = cardRepository;
        this.cardService = cardService;
        this.reactionRepository = reactionRepository;
        this.opinionRepository = opinionRepository;
        this.noticeRepository = noticeRepository;
    }

    @Transactional
    public TakeoverResponse takeOver(String parentId, DeviceInfo actor, TakeoverRequest request) {
        Card parent = cardRepository.findById(parentId)
                .orElseThrow(() -> new CardNotFoundException(parentId));
        if (parent.isHidden()) {
            throw new CardNotFoundException(parentId);
        }
        Instant now = Instant.now();

        if (!parent.status(now).canTakeOver()) {
            throw new BadRequestException("보류·중단·정체된 카드만 이어받을 수 있어요.");
        }

        Optional<Card> alive = cardRepository.findByParentId(parentId).stream()
                .filter(child -> !child.status(now).canTakeOver())
                .findFirst();
        if (alive.isPresent()) {
            throw new ConflictException("이미 이어받아 진행 중인 카드가 있어요: " + alive.get().getId());
        }

        CardResponse created = cardService.create(request.card(), actor.id(), actor.nickname(),
                parentId, request.takeoverNote().trim());

        Set<String> targets = new HashSet<>();
        reactionRepository.findByCardId(parentId).forEach(r -> targets.add(r.getDeviceId()));
        opinionRepository.findByCardId(parentId).forEach(o -> targets.add(o.getDeviceId()));
        targets.remove(actor.id());

        List<Notice> notices = targets.stream()
                .map(deviceId -> new Notice(Ids.newId(), deviceId, created.id(), NoticeKind.TAKEOVER))
                .toList();
        noticeRepository.saveAll(notices);

        return new TakeoverResponse(created, notices.size());
    }

    @Transactional(readOnly = true)
    public List<CardResponse> takeovers(String parentId) {
        if (!cardRepository.existsByIdAndHiddenFalse(parentId)) {
            throw new CardNotFoundException(parentId);
        }
        Instant now = Instant.now();
        return cardRepository.findByParentId(parentId).stream()
                .filter(card -> !card.isHidden())
                .map(card -> CardResponse.from(card, now))
                .toList();
    }
}