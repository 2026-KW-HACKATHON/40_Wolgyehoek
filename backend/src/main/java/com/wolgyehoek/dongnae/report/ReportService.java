package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.reaction.Reaction;
import com.wolgyehoek.dongnae.reaction.ReactionRepository;
import com.wolgyehoek.dongnae.reaction.ReactionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;

import java.time.Instant;
import java.util.List;

@Service
public class ReportService {

    private final CardRepository cardRepository;
    private final ReactionRepository reactionRepository;
    private final OpinionRepository opinionRepository;

    public ReportService(CardRepository cardRepository, ReactionRepository reactionRepository, OpinionRepository opinionRepository) {
        this.cardRepository = cardRepository;
        this.reactionRepository = reactionRepository;
        this.opinionRepository = opinionRepository;
    }

    @Transactional(readOnly = true)
    public ReportViewResponse view(String cardId, DeviceInfo viewer) {
        Card card = findCard(cardId, viewer);
        CardStatus status = card.status(Instant.now());

        List<Reaction> reactions = reactionRepository.findByCardId(cardId);
        ReactionSummary summary = ReportCalculator.summarize(reactions);

        List<Integer> stepCounts = summary.steps().stream()
                .map(ReactionSummary.StepStat::count)
                .toList();

        ReactionResponse myReaction = reactions.stream()
                .filter(r -> r.getDeviceId().equals(viewer.id()))
                .findFirst()
                .map(ReactionResponse::from)
                .orElse(null);

        boolean canManage = canManage(card, viewer);
        boolean reportVisible = status != CardStatus.OPEN && (card.isReportPublished() || canManage);
        ReportResponse report = reportVisible
                ? ReportResponse.of(summary, ReportCalculator.summarizeOpinions(opinionRepository.findByCardId(cardId)), card)
                : null;

        return new ReportViewResponse(status, status.getLabel(), stepCounts, myReaction, canManage, report);
    }

    @Transactional
    public ReportResponse publish(String cardId, DeviceInfo actor, PublishReportRequest request) {
        Card card = findCard(cardId, actor);

        if (!canManage(card, actor)) {
            throw new ForbiddenException("제안자나 운영자만 리포트를 공개할 수 있어요.");
        }

        Instant now = Instant.now();
        if (card.status(now) == CardStatus.OPEN) {
            throw new BadRequestException("검증 기간이 끝난 뒤에 공개할 수 있어요.");
        }

        card.publishReport(cleanSummary(request.summary()), now);

        ReactionSummary summary = ReportCalculator.summarize(reactionRepository.findByCardId(cardId));
        OpinionSummary opinions = ReportCalculator.summarizeOpinions(opinionRepository.findByCardId(cardId));
        return ReportResponse.of(summary, opinions, card);
    }

    private Card findCard(String cardId, DeviceInfo device) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException(cardId));
        if (card.isHidden() && !device.operator()) {
            throw new CardNotFoundException(cardId);
        }
        return card;
    }

    private boolean canManage(Card card, DeviceInfo device) {
        return card.canBeManagedBy(device.id(), device.operator());
    }

    private String cleanSummary(String summary) {
        if (summary == null) {
            return null;
        }
        String trimmed = summary.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}