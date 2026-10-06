package com.wolgyehoek.dongnae.card;

public enum Decision {

    GO("진행"),
    HOLD("보류"),
    STOP("중단");

    private final String label;

    Decision(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}