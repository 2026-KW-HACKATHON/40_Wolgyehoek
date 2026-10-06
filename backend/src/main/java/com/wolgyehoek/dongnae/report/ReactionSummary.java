package com.wolgyehoek.dongnae.report;

import java.util.List;

public record ReactionSummary(
        int total,
        boolean showRatio,
        List<StepStat> steps,
        List<AtLeastStat> atLeast,
        PriceStat price,
        RespondentStat respondents,
        int geoInside
) {

    public record StepStat(int step, int count, Double ratio) {
    }

    public record AtLeastStat(int step, int count) {
    }

    public record PriceStat(int count, Integer median, Integer min, Integer max) {
    }

    public record RespondentStat(int resident, int workStudy, int visitor) {
    }
}