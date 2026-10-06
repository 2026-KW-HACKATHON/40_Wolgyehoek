package com.wolgyehoek.dongnae.notice;

public enum NoticeKind {

    CONCLUSION("결론이 도착했어요!"),
    TAKEOVER("보류됐던 아이디어가 다시 시작됐어요!");

    private final String label;

    NoticeKind(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}