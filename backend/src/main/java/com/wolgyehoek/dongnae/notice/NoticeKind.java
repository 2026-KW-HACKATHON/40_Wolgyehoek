package com.wolgyehoek.dongnae.notice;

public enum NoticeKind {

    CONCLUSION("결론이 도착했어요!"),
    TAKEOVER("보류됐던 아이디어가 다시 시작됐어요!"),
    SUCCESS("함께하기로 한 아이디어가 성사됐어요!"),
    SUCCESS_NOTE("성사된 아이디어의 일정이 정해졌어요!");

    private final String label;

    NoticeKind(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}