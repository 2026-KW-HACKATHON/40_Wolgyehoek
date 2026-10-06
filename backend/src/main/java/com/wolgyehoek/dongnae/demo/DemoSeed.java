package com.wolgyehoek.dongnae.demo;

import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.conclusion.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@ConditionalOnProperty(name = "dongnae.demo-seed", havingValue = "true")
public class DemoSeed implements ApplicationRunner {
    private final CardRepository cards;
    private final ConclusionRepository conclusions;
    public DemoSeed(CardRepository cards, ConclusionRepository conclusions) { this.cards = cards; this.conclusions = conclusions; }
    @Override @Transactional
    public void run(ApplicationArguments args) {
        if (cards.count() > 0) return;
        Instant now = Instant.now();
        add("demo-market", "광운로 주말 플리마켓", "학생과 주민이 함께 여는 작은 플리마켓을 제안해요. 운영 장소와 주체를 정하고 다시 수요를 확인하고 싶어요.", "주민·학생", "광운로", "지역 교류", now, Decision.HOLD, "운영 주체 없음", "지속적으로 운영할 팀을 찾고 있어요.");
        add("demo-study", "청년과 주민이 함께 쓰는 공부 공간", "저녁 시간에 조용히 공부할 수 있는 동네 공간을 함께 활용하면 좋겠어요. 대여 가능한 공간을 확인하는 단계예요.", "청년·주민", "월계1동", "공간 공유", now, Decision.STOP, "예산·공간 부족", "현재 사용할 공간을 확보하지 못했어요.");
        add("demo-walk", "경춘선숲길 함께 걷기", "혼자 걷기보다 동네 사람들과 정해진 시간에 함께 걷는 모임을 제안해요. 참여하고 싶은 시간과 조건을 알려 주세요.", "주민·방문자", "경춘선숲길", "이웃 교류", now, null, "", "");
    }
    private void add(String id, String title, String body, String target, String place, String effect, Instant now, Decision decision, String tag, String reason) {
        Card c = new Card(id, title, body, target, place, effect, "demo-archive", "예시 기록", now.minus(21, ChronoUnit.DAYS), decision == null ? now.plus(14, ChronoUnit.DAYS) : now.minus(7, ChronoUnit.DAYS));
        c.markSeed();
        if (decision != null) c.conclude(decision);
        cards.save(c);
        if (decision != null) conclusions.save(new Conclusion(id + "-end", id, decision, List.of(tag), reason, "demo-archive"));
    }
}
