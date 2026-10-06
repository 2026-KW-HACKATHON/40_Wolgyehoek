package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.ConflictException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.common.NotFoundException;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.opinion.OpinionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FlagService {

    private final FlagRepository flagRepository;
    private final CardRepository cardRepository;
    private final OpinionRepository opinionRepository;

    public FlagService(FlagRepository flagRepository, CardRepository cardRepository,
                       OpinionRepository opinionRepository) {
        this.flagRepository = flagRepository;
        this.cardRepository = cardRepository;
        this.opinionRepository = opinionRepository;
    }

    @Transactional
    public FlagResponse flagCard(String cardId, DeviceInfo reporter, String reason) {
        if (!cardRepository.existsByIdAndHiddenFalse(cardId)) {
            throw new CardNotFoundException(cardId);
        }
        return save(FlagTargetType.CARD, cardId, reporter, reason);
    }

    @Transactional
    public FlagResponse flagOpinion(String opinionId, DeviceInfo reporter, String reason) {
        if (!opinionRepository.existsByIdAndHiddenFalse(opinionId)) {
            throw new NotFoundException("의견을 찾을 수 없어요: " + opinionId);
        }
        return save(FlagTargetType.OPINION, opinionId, reporter, reason);
    }

    private FlagResponse save(FlagTargetType type, String targetId, DeviceInfo reporter, String reason) {
        if (flagRepository.existsByTargetTypeAndTargetIdAndDeviceId(type, targetId, reporter.id())) {
            throw new ConflictException("이미 신고한 글이에요.");
        }
        Flag flag = flagRepository.save(new Flag(Ids.newId(), type, targetId, reporter.id(), reason.trim()));
        return FlagResponse.from(flag);
    }

}