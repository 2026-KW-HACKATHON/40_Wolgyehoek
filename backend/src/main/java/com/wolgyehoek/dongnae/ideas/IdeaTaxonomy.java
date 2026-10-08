package com.wolgyehoek.dongnae.ideas;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public final class IdeaTaxonomy {

    public record Concept(String key, String label, String topic, boolean broad, List<String> words) {
    }

    public record Zone(String key, String label, List<String> words) {
    }

    public record Profile(List<Concept> concepts, Zone zone, String topic, Optional<Concept> lead) {
        public Set<String> conceptKeys() {
            return concepts.stream().map(Concept::key).collect(Collectors.toSet());
        }
    }

    public static final List<Concept> CONCEPTS = List.of(
            new Concept("MARKET", "장터·플리마켓", "COMMERCE", false, List.of("플리마켓", "벼룩시장", "장터", "마켓", "바자회")),
            new Concept("SHOP", "골목 가게 살리기", "COMMERCE", true, List.of("상권", "소상공인", "가게", "식당", "상점", "상가", "공실", "지역화폐", "쿠폰", "맛집", "간판", "가로활성화", "문화가로", "야시장")),
            new Concept("MEAL", "함께 먹기", "NEIGHBOR", false, List.of("점심", "식사", "식탁", "반찬", "혼밥", "도시락", "급식", "밥상")),
            new Concept("NIGHT", "밤길·방범", "SAFETY", false, List.of("밤길", "야간", "가로등", "조명", "어두", "귀갓길", "안심", "cctv", "방범", "순찰")),
            new Concept("TRAFFIC", "보행·교통", "SAFETY", false, List.of("횡단보도", "보행", "통학로", "마을버스", "정류장", "주차", "킥보드", "자전거", "교통", "공사", "우회")),
            new Concept("WEATHER", "폭염·침수·제설", "SAFETY", false, List.of("폭염", "한파", "제설", "염화칼슘", "침수", "하수", "빗물")),
            new Concept("TRASH", "쓰레기·분리배출", "ENVIRONMENT", false, List.of("쓰레기", "분리배출", "무단투기", "재활용", "청소", "클린", "꽁초")),
            new Concept("GREEN", "녹지·하천", "ENVIRONMENT", false, List.of("텃밭", "화단", "꽃길", "정원", "나무", "녹지", "하천", "생태", "방제", "해충")),
            new Concept("WALK", "걷기·운동", "NEIGHBOR", false, List.of("걷기", "산책", "운동", "러닝", "체조", "걸어요", "걸을", "한바퀴")),
            new Concept("REPAIR", "수리·나눔", "ENVIRONMENT", false, List.of("수리", "고치", "재사용", "나눔", "업사이클", "대여", "공유물품")),
            new Concept("DIGITAL", "디지털 배움", "CARE", false, List.of("키오스크", "스마트폰", "디지털", "핸드폰", "휴대폰")),
            new Concept("ELDER", "어르신 돌봄", "CARE", false, List.of("어르신", "노인", "경로당", "독거", "홀몸", "치매", "시니어", "안부", "고독사")),
            new Concept("CHILD", "아이 돌봄", "CARE", false, List.of("아이들", "아이와", "아동", "어린이", "초등", "방과후", "육아", "키즈", "놀이터")),
            new Concept("MENTOR", "멘토링·배움", "YOUTH", false, List.of("멘토", "과외", "공부방", "학습", "재능기부", "강좌", "교실", "클래스")),
            new Concept("SPACE", "함께 쓰는 공간", "YOUTH", true, List.of("공간", "라운지", "스터디카페", "빈집", "빈상가", "거점", "팹랩", "창업")),
            new Concept("CULTURE", "축제·문화", "NEIGHBOR", false, List.of("축제", "공연", "영화", "전시", "버스킹", "상영", "음악회")),
            new Concept("GATHER", "청년·주민 교류", "YOUTH", true, List.of("교류", "모임", "커뮤니티", "동아리", "청년")),
            new Concept("HOUSING", "자취·주거", "YOUTH", false, List.of("원룸", "자취", "전세", "월세", "하숙", "주거환경")),
            new Concept("PET", "반려동물", "NEIGHBOR", false, List.of("반려", "강아지", "고양이", "유기견", "펫")),
            new Concept("HEALTH", "건강·마음", "CARE", true, List.of("건강", "의료", "병원", "정신건강", "우울", "고립"))
    );

    public static final Zone WIDE = new Zone("WIDE", "월계1동 전역", List.of());
    /** 노원구 전체에 걸친 기록. 월계1동 전역처럼 어느 동의 문제와도 이어진다. */
    public static final Zone NOWON = new Zone("NOWON", "노원구 전역", List.of("노원구전역", "노원구일대", "노원구전체", "구전역"));

    // 노원구의 다른 동은 월계1동 세부 장소보다 먼저 판정한다(예: 서울과기대 캠퍼스타운은 공릉동).
    public static final List<Zone> ZONES = List.of(
            new Zone("WOLGYE_23", "월계2·3동", List.of("월계2동", "월계3동", "월계주공", "초안산")),
            new Zone("GONGNEUNG", "공릉동", List.of("공릉", "태릉", "화랑대", "서울과기대", "서울과학기술대", "과기대", "서울여대", "서울여자대", "삼육대", "도깨비시장")),
            new Zone("SANGGYE", "상계동", List.of("상계동", "상계1동", "상계2동", "상계3·4동", "상계5동", "상계6·7동", "상계8동", "상계9동", "상계10동", "노원문화의거리", "수락산", "불암산", "당고개", "노원역", "마들역", "인덕대")),
            new Zone("JUNGGYE", "중계동", List.of("중계동", "중계본동", "중계1동", "중계2·3동", "중계4동", "백사마을", "은행사거리")),
            new Zone("HAGYE", "하계동", List.of("하계동", "하계1동", "하계2동", "하계역", "중평")),
            new Zone("KW_STATION", "광운대역", List.of("광운대역", "역세권", "물류부지")),
            new Zone("KW_UNIV", "광운대 앞", List.of("광운대", "광운로", "원룸촌", "대학가", "동해문화예술관", "캠퍼스타운", "비타민센터", "연촌재")),
            new Zone("SEOKGYE", "석계역", List.of("석계")),
            new Zone("YEONGCHUK", "영축산", List.of("영축산", "어울마루")),
            new Zone("GYEONGCHUN", "경춘선숲길", List.of("경춘선", "숲길")),
            new Zone("STREAM", "중랑천·우이천", List.of("중랑천", "우이천", "하천변")),
            new Zone("FACILITY", "주민센터·복지시설", List.of("주민센터", "행정복지센터", "휴센터", "경로당", "복지관", "도서관", "문화센터")),
            new Zone("HOMES", "주거 골목", List.of("아파트", "단지", "골목", "주택가", "빌라")),
            NOWON,
            WIDE
    );

    /** 동 전체·구 전체 기록은 특정 장소를 가리지 않고 어느 장소의 문제와도 이어진다. */
    public static boolean isWide(Zone zone) {
        return zone == WIDE || zone == NOWON;
    }

    private IdeaTaxonomy() {
    }

    public static Profile classify(String title, String problem, String body, String place, String topic) {
        String text = normalize(String.join(" ", nz(title), nz(problem), nz(body), nz(place)));
        List<Concept> concepts = CONCEPTS.stream().filter(c -> c.words().stream().anyMatch(text::contains)).toList();
        Zone zone = zoneOf(normalize(nz(place))).or(() -> zoneOf(text)).orElse(WIDE);
        Optional<Concept> lead = leadOf(concepts, normalize(nz(title)), text);
        String resolved = topic != null && !topic.isBlank() ? topic : lead.map(Concept::topic).orElse("");
        return new Profile(concepts, zone, resolved, lead);
    }

    private static Optional<Concept> leadOf(List<Concept> concepts, String title, String text) {
        Comparator<Concept> earliest = Comparator.comparingInt((Concept c) -> c.broad() ? 1 : 0)
                .thenComparingInt(c -> firstIndex(c, title) < 0 ? Integer.MAX_VALUE : firstIndex(c, title))
                .thenComparingInt(c -> firstIndex(c, text));
        return concepts.stream().min(earliest);
    }

    private static int firstIndex(Concept c, String s) {
        return c.words().stream().mapToInt(s::indexOf).filter(i -> i >= 0).min().orElse(-1);
    }

    public static Zone zone(String key) {
        return ZONES.stream().filter(z -> z.key().equals(key)).findFirst().orElse(WIDE);
    }

    private static Optional<Zone> zoneOf(String text) {
        return ZONES.stream().filter(z -> z.words().stream().anyMatch(text::contains)).findFirst();
    }

    private static String normalize(String s) {
        return s.toLowerCase(Locale.ROOT).replaceAll("\\s+", "");
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
