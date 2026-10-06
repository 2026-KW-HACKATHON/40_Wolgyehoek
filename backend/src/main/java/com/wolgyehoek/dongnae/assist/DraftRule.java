package com.wolgyehoek.dongnae.assist;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public final class DraftRule {

    private static final List<String> PLACES = List.of(
            "광운로", "석계역", "광운대역", "광운대", "경춘선숲길", "우이천", "중랑천", "초안산", "영축산",
            "월계1동 주민센터", "주민센터", "석계역문화공원", "골목", "공터", "시장", "놀이터", "공원", "버스정류장");

    private static final List<Hint> TARGETS = List.of(
            new Hint("어르신|노인|시니어", "어르신"),
            new Hint("아이|어린이|초등|유아", "아이와 보호자"),
            new Hint("학생|대학생|광운대", "학생"),
            new Hint("청년", "청년"),
            new Hint("1인 가구|혼자", "1인 가구"),
            new Hint("반려|강아지|고양이", "반려인"),
            new Hint("소상공인|가게|상인|사장", "소상공인"),
            new Hint("주민|이웃|동네", "월계1동 주민"));

    private static final List<Hint> EFFECTS = List.of(
            new Hint("안전|어두|범죄|가로등", "밤길 안전이 좋아진다"),
            new Hint("상권|가게|매출|장터|마켓", "골목 상권에 사람이 모인다"),
            new Hint("쓰레기|환경|재활용|탄소", "동네 환경이 깨끗해진다"),
            new Hint("교류|모임|함께|이웃", "이웃 간 교류가 늘어난다"),
            new Hint("접근|휠체어|유모차|계단|배리어", "이동 약자의 접근성이 좋아진다"));

    private static final Pattern REQUEST_ENDINGS = Pattern.compile(
            "\\s*(\\S*(으면|면)\\s*(좋겠|해요|합니다|한다).*|\\s*(필요해요|필요합니다|필요하다|해\\s?주세요|해\\s?주면.*))$");

    private DraftRule() {
    }

    public static DraftResponse fromText(String text) {
        String clean = text.replaceAll("\\s+", " ").trim();
        String firstSentence = clean.split("[.!?。\\n]")[0].trim();
        if (firstSentence.isEmpty()) {
            firstSentence = clean;
        }

        String title = toTitle(firstSentence);
        if (title.isEmpty()) {
            title = firstSentence.length() > 40 ? firstSentence.substring(0, 40) : firstSentence;
        }

        String place = PLACES.stream().filter(clean::contains).limit(2).collect(Collectors.joining(", "));
        String target = TARGETS.stream().filter(h -> h.matches(clean)).map(Hint::value).limit(2)
                .collect(Collectors.joining(", "));
        String effect = EFFECTS.stream().filter(h -> h.matches(clean)).map(Hint::value).findFirst()
                .orElse("동네 생활이 조금 더 편해진다");

        return new DraftResponse(
                title.isEmpty() ? "새 아이디어" : title,
                target.isEmpty() ? "월계1동 주민" : target,
                place.isEmpty() ? "월계1동" : place,
                effect,
                DraftSource.RULE);
    }

    static String toTitle(String sentence) {
        String t = REQUEST_ENDINGS.matcher(sentence).replaceFirst("");
        t = t.replaceFirst("(을|를|이|가|은|는)$", "").trim();
        if (t.length() > 40) {
            t = t.substring(0, 40).replaceFirst("\\s+\\S*$", "") + "…";
        }
        return t;
    }

    private record Hint(Pattern pattern, String value) {
        Hint(String regex, String value) {
            this(Pattern.compile(regex), value);
        }

        boolean matches(String text) {
            return pattern.matcher(text).find();
        }
    }
}