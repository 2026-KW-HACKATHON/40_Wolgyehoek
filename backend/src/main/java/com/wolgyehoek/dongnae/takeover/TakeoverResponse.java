package com.wolgyehoek.dongnae.takeover;

import com.wolgyehoek.dongnae.card.CardResponse;

public record TakeoverResponse(CardResponse card, int notifiedCount) {
}