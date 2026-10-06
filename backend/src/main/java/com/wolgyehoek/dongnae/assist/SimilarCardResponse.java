package com.wolgyehoek.dongnae.assist;

import com.wolgyehoek.dongnae.card.CardResponse;

public record SimilarCardResponse(CardResponse card, double score) {
}