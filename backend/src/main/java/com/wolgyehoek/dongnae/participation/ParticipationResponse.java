package com.wolgyehoek.dongnae.participation;

import com.wolgyehoek.dongnae.card.CardResponse;

import java.util.List;

public record ParticipationResponse(
        List<CardResponse> proposed,
        List<CardResponse> reacted,
        List<CardResponse> opinioned
) {
}