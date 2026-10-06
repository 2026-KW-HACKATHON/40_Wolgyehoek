package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardResponse;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.common.NotFoundException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.opinion.Opinion;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ModerationService {

    private final FlagRepository flagRepository;
    private final CardRepository cardRepository;
    private final OpinionRepository opinionRepository;
    private final ModerationLogRepository logRepository;

    public ModerationService(FlagRepository flagRepository, CardRepository cardRepository,
                             OpinionRepository opinionRepository, ModerationLogRepository logRepository) {
        this.flagRepository = flagRepository;
        this.cardRepository = cardRepository;
        this.opinionRepository = opinionRepository;
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public List<FlagResponse> openFlags(DeviceInfo actor) {
        requireOperator(actor);
        return flagRepository.findByStatusOrderByCreatedAtAsc(FlagStatus.OPEN).stream()
                .map(FlagResponse::from)
                .toList();
    }

    @Transactional
    public FlagResponse hide(String flagId, DeviceInfo actor, String note) {
        return handle(flagId, actor, note, FlagStatus.HIDDEN);
    }

    @Transactional
    public FlagResponse keep(String flagId, DeviceInfo actor, String note) {
        return handle(flagId, actor, note, FlagStatus.KEPT);
    }

    @Transactional
    public CardResponse closeNow(String cardId, DeviceInfo actor) {
        requireOperator(actor);
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException(cardId));
        Instant now = Instant.now();
        card.closeNow(now);
        logRepository.save(new ModerationLog(Ids.newId(), actor.id(), ModerationAction.CLOSE_NOW, "card:" + cardId, ""));
        return CardResponse.from(card, now);
    }

    private FlagResponse handle(String flagId, DeviceInfo actor, String note, FlagStatus result) {
        requireOperator(actor);
        Flag flag = flagRepository.findById(flagId)
                .orElseThrow(() -> new NotFoundException("신고를 찾을 수 없어요: " + flagId));
        String cleanNote = (note == null) ? "" : note.trim();
        Instant now = Instant.now();

        if (result == FlagStatus.HIDDEN) {
            hideTarget(flag);
        }
        flagRepository.findByTargetTypeAndTargetId(flag.getTargetType(), flag.getTargetId())
                .forEach(f -> f.handle(result, cleanNote, now));

        ModerationAction action = (result == FlagStatus.HIDDEN) ? ModerationAction.HIDE : ModerationAction.KEEP;
        String target = flag.getTargetType().name().toLowerCase() + ":" + flag.getTargetId();
        logRepository.save(new ModerationLog(Ids.newId(), actor.id(), action, target, cleanNote));

        return FlagResponse.from(flag);
    }

    private void hideTarget(Flag flag) {
        if (flag.getTargetType() == FlagTargetType.CARD) {
            cardRepository.findById(flag.getTargetId()).ifPresent(Card::hide);
        } else {
            opinionRepository.findById(flag.getTargetId()).ifPresent(Opinion::hide);
        }
    }

    private void requireOperator(DeviceInfo actor) {
        if (!actor.operator()) {
            throw new ForbiddenException("운영자만 할 수 있어요.");
        }
    }

}