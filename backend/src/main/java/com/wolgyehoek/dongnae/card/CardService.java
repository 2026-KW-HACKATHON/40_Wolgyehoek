package com.wolgyehoek.dongnae.card;

import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.media.MediaService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CardService {

    private static final int DEFAULT_WEEKS = 2;

    private final CardRepository cardRepository;
    private final MediaService mediaService;

    public CardService(CardRepository cardRepository, MediaService mediaService) {
        this.cardRepository = cardRepository;
        this.mediaService = mediaService;
    }

    @Transactional
    public CardResponse create(CreateCardRequest request, String proposerId, String proposerName) {
        return create(request, proposerId, proposerName, null, null);
    }

    @Transactional
    public CardResponse create(CreateCardRequest request, String proposerId, String proposerName,
                               String parentId, String takeoverNote) {
        String id = Ids.newId();
        Instant now = Instant.now();
        int weeks = (request.weeks() == null) ? DEFAULT_WEEKS : request.weeks();

        Card card = new Card(
                id,
                request.title().trim(),
                request.body().trim(),
                clean(request.target()),
                clean(request.place()),
                clean(request.effect()),
                proposerId,
                proposerName,
                now,
                now.plus(weeks * 7, ChronoUnit.DAYS)
        );
        if (parentId != null) {
            card.linkParent(parentId, takeoverNote);
        }
        if (request.goal() != null) {
            card.setGoal(request.goal());
        }

        Card saved = cardRepository.saveAndFlush(card);
        mediaService.attach(id, proposerId, request.mediaIds());
        return CardResponse.from(saved, now);
    }

    @Transactional(readOnly = true)
    public CardResponse get(String id) {
        return get(id, false);
    }

    @Transactional(readOnly = true)
    public CardResponse get(String id, boolean includeHidden) {
        Card card = cardRepository.findById(id).orElseThrow(() -> new CardNotFoundException(id));
        if(card.isHidden() && !includeHidden) {
            throw new CardNotFoundException(id);
        }
        return CardResponse.from(card, Instant.now());
    }

    @Transactional(readOnly = true)
    public List<CardResponse> getAll()
    {
        Instant now = Instant.now();
        return cardRepository.findByHiddenFalse().stream().map(card -> CardResponse.from(card, now)).toList();
    }

    private String clean(String value) {
        return (value == null) ? "" : value.trim();
    }
}
