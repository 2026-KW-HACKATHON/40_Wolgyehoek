package com.wolgyehoek.dongnae.ideas;

import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class Ontology {

    public enum NodeType {
        IDEA("시도"), NEED("문제 영역"), PLACE("장소"), ACTOR("주체"), BENEFICIARY("대상"), BARRIER("멈춘 이유"), SOURCE("출처");

        private final String label;

        NodeType(String label) {
            this.label = label;
        }

        public String label() {
            return label;
        }
    }

    public enum Relation {
        ADDRESSES, LOCATED_IN, LED_BY, SERVES, BLOCKED_BY, CITES, CONTINUES
    }

    public enum State {
        GOING, STOPPED, LIVE, UNKNOWN
    }

    public record Beneficiary(String key, String label, List<String> words) {
    }

    public static final List<Beneficiary> BENEFICIARIES = List.of(
            new Beneficiary("ELDER", "어르신", List.of("어르신", "노인", "시니어", "경로당", "홀몸", "독거", "고독사")),
            new Beneficiary("YOUTH", "청년·대학생", List.of("청년", "대학생", "학생", "광운대생", "자취")),
            new Beneficiary("CHILD", "아이·가족", List.of("아이", "어린이", "아동", "초등", "가족", "육아", "놀이터")),
            new Beneficiary("MERCHANT", "상인·가게", List.of("상인", "상점", "가게", "식당", "소상공인", "상가", "창업")),
            new Beneficiary("SOLO", "1인 가구", List.of("1인", "원룸", "혼밥", "혼자")),
            new Beneficiary("COMMUTER", "통학·통근자", List.of("통학", "출퇴근", "퇴근", "보행자", "통행"))
    );

    public static final String RESIDENT_ACTOR = "동네서랍 주민";
    public static final String DEMO_ACTOR = "동네서랍 시연";

    private static final Map<String, String> ACTOR_KINDS = Map.of(
            "월계1동주민센터", "행정", "노원구", "행정", "월계1동 주민총회", "주민 조직",
            "광운대 지역연계수업", "대학", "광운대 캠퍼스타운", "대학",
            RESIDENT_ACTOR, "주민", DEMO_ACTOR, "시연");

    private Ontology() {
    }

    public static List<Beneficiary> beneficiaries(String... texts) {
        String text = String.join(" ", java.util.Arrays.stream(texts).map(t -> t == null ? "" : t).toList())
                .toLowerCase(Locale.ROOT).replaceAll("\\s+", "");
        return BENEFICIARIES.stream().filter(b -> b.words().stream().anyMatch(text::contains)).toList();
    }

    /** 공개 기록은 원문의 주체, 동네서랍 카드는 개인 이름 대신 주민·시연 주체로 묶는다. */
    public static String actor(String origin, String proposerName, boolean seed) {
        if (origin != null && !origin.isEmpty() && proposerName != null && !proposerName.isBlank()) return proposerName.trim();
        return seed ? DEMO_ACTOR : RESIDENT_ACTOR;
    }

    public static String actorKind(String actor) {
        return ACTOR_KINDS.getOrDefault(actor, "기타");
    }
}
