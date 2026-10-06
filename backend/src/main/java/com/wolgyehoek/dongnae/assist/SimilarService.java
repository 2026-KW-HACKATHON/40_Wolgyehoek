package com.wolgyehoek.dongnae.assist;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class SimilarService {

    private static final int LIMIT = 3;

    private final CardRepository cardRepository;

    public SimilarService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<SimilarCardResponse> find(String title, String body) {
        Set<String> draft = Similarity.bigrams(title + " " + (body == null ? "" : body));
        Instant now = Instant.now();

        return cardRepository.findByHiddenFalse().stream()
                .map(card -> new Scored(card, Similarity.jaccard(draft,
                        Similarity.bigrams(card.getTitle() + " " + card.getBody()))))
                .filter(s -> s.score() >= Similarity.THRESHOLD)
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .limit(LIMIT)
                .map(s -> new SimilarCardResponse(CardResponse.from(s.card(), now),
                        Math.round(s.score() * 100) / 100.0))
                .toList();
    }

    private record Scored(Card card, double score) {
    }
}