package com.wolgyehoek.dongnae.opinion;

public enum Stance {

    PRO("찬성"),
    CON("반대"),
    CONDITIONAL("조건부 찬성");

    private final String label;

    Stance(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}