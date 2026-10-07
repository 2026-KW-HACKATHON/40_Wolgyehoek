package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.Decision;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
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
import java.util.Set;

@Service
public class ConclusionService {

    public static final Set<String> REASON_TAGS =
            Set.of("운영 주체 없음", "예산·공간 부족", "수요 부족", "규제·허가", "기타");

    private final CardRepository cardRepository;
    private final ConclusionRepository conclusionRepository;
    private final ReactionRepository reactionRepository;
    private final OpinionRepository opinionRepository;
    private final NoticeRepository noticeRepository;
    private final com.wolgyehoek.dongnae.credits.CreditService credits;

    public ConclusionService(CardRepository cardRepository,
                             ConclusionRepository conclusionRepository,
                             ReactionRepository reactionRepository,
                             OpinionRepository opinionRepository,
                             NoticeRepository noticeRepository, com.wolgyehoek.dongnae.credits.CreditService credits) {
        this.cardRepository = cardRepository;
        this.conclusionRepository = conclusionRepository;
        this.reactionRepository = reactionRepository;
        this.opinionRepository = opinionRepository;
        this.noticeRepository = noticeRepository;
        this.credits = credits;
    }

    @Transactional
    public RecordConclusionResponse record(String cardId, DeviceInfo actor, RecordConclusionRequest request) {
        Card card = cardRepository.findLockedById(cardId)
                .orElseThrow(() -> new CardNotFoundException(cardId));

        if (card.isHidden()) {
            throw new CardNotFoundException(cardId);
        }

        if (!card.canBeManagedBy(actor.id(), actor.operator())) {
            throw new ForbiddenException("제안자나 운영자만 결론을 기록할 수 있어요.");
        }
        if (!card.status(Instant.now()).canConclude()) {
            throw new BadRequestException("검증 기간이 끝난 뒤에 결론을 기록할 수 있어요.");
        }

        List<String> tags = (request.reasonTags() == null)
                ? List.of()
                : request.reasonTags().stream().distinct().toList();
        if (!REASON_TAGS.containsAll(tags)) {
            throw new BadRequestException("사유 태그가 올바르지 않아요.");
        }
        String reason = (request.reason() == null) ? "" : request.reason().trim();
        if (request.decision() != Decision.GO && (tags.isEmpty() || reason.isEmpty())) {
            throw new BadRequestException("보류·중단은 사유 태그와 사유를 모두 적어야 저장돼요.");
        }

        boolean firstByActor = conclusionRepository.findByCardIdOrderByCreatedAtDesc(cardId).stream()
                .noneMatch(c -> c.getDecidedBy().equals(actor.id()));
        Conclusion conclusion = conclusionRepository.save(
                new Conclusion(Ids.newId(), cardId, request.decision(), tags, reason, actor.id()));
        card.conclude(request.decision());
        if (firstByActor) {
            credits.award(actor.id(), com.wolgyehoek.dongnae.credits.CreditService.CONCLUSION_POINTS, "RECORD", card.getTitle() + " · 결론 기록");
        }

        Set<String> targets = new HashSet<>();
        reactionRepository.findByCardId(cardId).forEach(r -> targets.add(r.getDeviceId()));
        opinionRepository.findByCardId(cardId).forEach(o -> targets.add(o.getDeviceId()));
        targets.addAll(credits.participantIds(cardId));
        targets.remove(actor.id());

        List<Notice> notices = targets.stream()
                .map(deviceId -> new Notice(Ids.newId(), deviceId, cardId, NoticeKind.CONCLUSION))
                .toList();
        noticeRepository.saveAll(notices);

        return new RecordConclusionResponse(ConclusionResponse.from(conclusion), notices.size());
    }

    @Transactional(readOnly = true)
    public List<ConclusionResponse> history(String cardId) {
        if (!cardRepository.existsByIdAndHiddenFalse(cardId)) {
            throw new CardNotFoundException(cardId);
        }
        return conclusionRepository.findByCardIdOrderByCreatedAtDesc(cardId).stream()
                .map(ConclusionResponse::from)
                .toList();
    }
}