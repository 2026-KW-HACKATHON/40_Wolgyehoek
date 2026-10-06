package com.wolgyehoek.dongnae.reaction;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.Ids;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class ReactionService {

    private static final int PRICE_STEP = 3;

    private final ReactionRepository reactionRepository;
    private final CardRepository cardRepository;

    public ReactionService(ReactionRepository reactionRepository, CardRepository cardRepository) {
        this.reactionRepository = reactionRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public ReactionResponse react(String cardId, String deviceId, ReactRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException(cardId));

        if (card.isHidden()) {
            throw new CardNotFoundException(cardId);
        }

        if (!card.isOpen(Instant.now())) {
            throw new BadRequestException("검증 기간이 끝난 카드에는 반응할 수 없어요.");
        }

        int step = request.step();
        Integer price = (step == PRICE_STEP) ? request.price() : null;
        if (step == PRICE_STEP && price == null) {
            throw new BadRequestException("'이 가격이면 쓰겠다'를 고르면 희망 가격을 적어 주세요.");
        }

        Optional<Reaction> existing = reactionRepository.findByCardIdAndDeviceId(cardId, deviceId);
        Reaction reaction;
        if (existing.isPresent()) {
            reaction = existing.get();
            reaction.update(step, price, request.respondentType(), request.geoInside());
        } else {
            reaction = reactionRepository.save(new Reaction(
                    Ids.newId(), cardId, deviceId, step, price, request.respondentType(), request.geoInside()));
        }

        return ReactionResponse.from(reaction);
    }

}