package com.wolgyehoek.dongnae.assist;

import java.util.HashSet;
import java.util.Set;

public final class Similarity {

    public static final double THRESHOLD = 0.2;

    private Similarity() {
    }

    public static Set<String> bigrams(String text) {
        String s = text.toLowerCase().replaceAll("[^\\p{L}\\p{N}]+", "");
        Set<String> out = new HashSet<>();
        for (int i = 0; i < s.length() - 1; i++) {
            out.add(s.substring(i, i + 2));
        }
        return out;
    }

    public static double jaccard(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) {
            return 0;
        }
        int intersection = 0;
        for (String x : a) {
            if (b.contains(x)) {
                intersection++;
            }
        }
        return (double) intersection / (a.size() + b.size() - intersection);
    }
}