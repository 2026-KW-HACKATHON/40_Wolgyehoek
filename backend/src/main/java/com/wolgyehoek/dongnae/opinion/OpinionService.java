package com.wolgyehoek.dongnae.opinion;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OpinionService {

    private final OpinionRepository opinionRepository;
    private final CardRepository cardRepository;

    public OpinionService(OpinionRepository opinionRepository, CardRepository cardRepository) {
        this.opinionRepository = opinionRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public OpinionResponse create(String cardId, DeviceInfo author, CreateOpinionRequest request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException(cardId));

        if (card.isHidden()) {
            throw new CardNotFoundException(cardId);
        }

        String condition = (request.stance() == Stance.CONDITIONAL) ? clean(request.condition()) : "";
        if (request.stance() == Stance.CONDITIONAL && condition.isEmpty()) {
            throw new BadRequestException("조건부 찬성은 어떤 조건이면 찬성하는지 적어 주세요.");
        }

        Opinion saved = opinionRepository.save(new Opinion(
                Ids.newId(), cardId, author.id(), author.nickname(),
                request.stance(), request.body().trim(), condition));
        return OpinionResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OpinionResponse> list(String cardId) {
        if (!cardRepository.existsByIdAndHiddenFalse(cardId)) {
            throw new CardNotFoundException(cardId);
        }
        return opinionRepository.findByCardIdAndHiddenFalseOrderByCreatedAtDesc(cardId).stream()
                .map(OpinionResponse::from)
                .toList();
    }

    private String clean(String value) {
        return (value == null) ? "" : value.trim();
    }

}
