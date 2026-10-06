package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.reaction.ReactionResponse;

import java.util.List;

public record ReportViewResponse(
        CardStatus status,
        String statusLabel,
        List<Integer> stepCounts,
        ReactionResponse myReaction,
        boolean canManage,
        ReportResponse report
) {
}