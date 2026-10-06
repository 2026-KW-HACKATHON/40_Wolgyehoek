package com.wolgyehoek.dongnae.report;

import com.wolgyehoek.dongnae.reaction.Reaction;

import java.util.ArrayList;
import java.util.List;
import com.wolgyehoek.dongnae.opinion.Opinion;
import com.wolgyehoek.dongnae.opinion.Stance;

public final class ReportCalculator {

    public static final int MIN_FOR_RATIO = 5;
    private static final int PRICE_STEP = 3;

    private ReportCalculator() {
    }

    public static ReactionSummary summarize(List<Reaction> reactions) {
        int total = reactions.size();
        boolean showRatio = total >= MIN_FOR_RATIO;

        List<ReactionSummary.StepStat> steps = new ArrayList<>();
        List<ReactionSummary.AtLeastStat> atLeast = new ArrayList<>();
        for (int step = 1; step <= 4; step++) {
            int count = countStep(reactions, step);
            Double ratio = showRatio ? (double) count / total : null;
            steps.add(new ReactionSummary.StepStat(step, count, ratio));
            atLeast.add(new ReactionSummary.AtLeastStat(step, countAtLeast(reactions, step)));
        }

        List<Integer> prices = reactions.stream()
                .filter(r -> r.getStep() == PRICE_STEP && r.getPrice() != null)
                .map(Reaction::getPrice)
                .sorted()
                .toList();
        ReactionSummary.PriceStat price = new ReactionSummary.PriceStat(
                prices.size(),
                median(prices),
                prices.isEmpty() ? null : prices.get(0),
                prices.isEmpty() ? null : prices.get(prices.size() - 1)
        );

        ReactionSummary.RespondentStat respondents = new ReactionSummary.RespondentStat(
                countType(reactions, "resident"),
                countType(reactions, "work_study"),
                countType(reactions, "visitor")
        );

        int geoInside = (int) reactions.stream()
                .filter(r -> Boolean.TRUE.equals(r.getGeoInside()))
                .count();

        return new ReactionSummary(total, showRatio, steps, atLeast, price, respondents, geoInside);
    }

    public static Integer median(List<Integer> values) {
        if (values.isEmpty()) {
            return null;
        }
        List<Integer> sorted = values.stream().sorted().toList();
        int mid = sorted.size() / 2;
        if (sorted.size() % 2 == 1) {
            return sorted.get(mid);
        }
        return (int) Math.round((sorted.get(mid - 1) + sorted.get(mid)) / 2.0);
    }

    public static OpinionSummary summarizeOpinions(List<Opinion> opinions) {
        List<Opinion> visible = opinions.stream()
                .filter(o -> !o.isHidden())
                .toList();
        return new OpinionSummary(
                countStance(visible, Stance.PRO),
                countStance(visible, Stance.CON),
                countStance(visible, Stance.CONDITIONAL)
        );
    }

    private static int countStance(List<Opinion> opinions, Stance stance) {
        return (int) opinions.stream().filter(o -> o.getStance() == stance).count();
    }

    private static int countStep(List<Reaction> reactions, int step) {
        return (int) reactions.stream().filter(r -> r.getStep() == step).count();
    }

    private static int countAtLeast(List<Reaction> reactions, int step) {
        return (int) reactions.stream().filter(r -> r.getStep() >= step).count();
    }

    private static int countType(List<Reaction> reactions, String type) {
        return (int) reactions.stream().filter(r -> type.equals(r.getRespondentType())).count();
    }
}