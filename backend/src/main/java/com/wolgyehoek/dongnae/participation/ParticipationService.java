package com.wolgyehoek.dongnae.participation;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardResponse;
import com.wolgyehoek.dongnae.opinion.Opinion;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;
import com.wolgyehoek.dongnae.reaction.Reaction;
import com.wolgyehoek.dongnae.reaction.ReactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ParticipationService {

    private final CardRepository cardRepository;
    private final ReactionRepository reactionRepository;
    private final OpinionRepository opinionRepository;

    public ParticipationService(CardRepository cardRepository, ReactionRepository reactionRepository,
                                OpinionRepository opinionRepository) {
        this.cardRepository = cardRepository;
        this.reactionRepository = reactionRepository;
        this.opinionRepository = opinionRepository;
    }

    @Transactional(readOnly = true)
    public ParticipationResponse of(String deviceId) {
        Instant now = Instant.now();

        List<CardResponse> proposed = cardRepository.findByProposerIdOrderByCreatedAtDesc(deviceId).stream()
                .filter(card -> !card.isHidden())
                .map(card -> CardResponse.from(card, now))
                .toList();

        Set<String> reactedIds = reactionRepository.findByDeviceId(deviceId).stream()
                .map(Reaction::getCardId)
                .collect(Collectors.toSet());
        Set<String> opinionedIds = opinionRepository.findByDeviceId(deviceId).stream()
                .map(Opinion::getCardId)
                .collect(Collectors.toSet());

        return new ParticipationResponse(proposed, cardsOf(reactedIds, now), cardsOf(opinionedIds, now));
    }

    private List<CardResponse> cardsOf(Set<String> cardIds, Instant now) {
        return cardRepository.findAllById(cardIds).stream()
                .filter(card -> !card.isHidden())
                .sorted(Comparator.comparing(Card::getCreatedAt).reversed())
                .map(card -> CardResponse.from(card, now))
                .toList();
    }
}