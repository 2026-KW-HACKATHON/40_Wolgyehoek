package com.wolgyehoek.dongnae.ideas;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.Decision;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.conclusion.Conclusion;
import com.wolgyehoek.dongnae.conclusion.ConclusionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class KnowledgeGraphServiceTest {

    @Autowired ArchiveLoader archive;
    @Autowired KnowledgeGraphService knowledge;
    @Autowired CardRepository cards;
    @Autowired ConclusionRepository conclusions;

    @BeforeEach
    void loadArchive() {
        archive.load();
    }

    private static KnowledgeGraphService.GraphNode node(KnowledgeGraphService.Graph g, String id) {
        return g.nodes().stream().filter(n -> n.id().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void 공개_기록은_문제영역_장소_주체_대상_출처로_이어진다() {
        var g = knowledge.graph();
        assertThat(g.links()).extracting(l -> l.source() + ">" + l.target() + ":" + l.type()).contains(
                "arc_meal24>need:ELDER:ADDRESSES",
                "arc_meal24>actor:월계1동주민센터:LED_BY",
                "arc_meal24>ben:ELDER:SERVES");
        assertThat(g.links()).anySatisfy(l -> {
            assertThat(l.source()).isEqualTo("arc_meal24");
            assertThat(l.type()).isEqualTo("CITES");
        });
        var elder = node(g, "need:ELDER");
        assertThat(elder.type()).isEqualTo("NEED");
        assertThat(elder.stats().attempts()).isGreaterThanOrEqualTo(5);
        assertThat(elder.stats().going()).isGreaterThanOrEqualTo(4);
        assertThat(node(g, "actor:월계1동주민센터").sub()).isEqualTo("행정");
        assertThat(node(g, "arc_pest21").state()).isEqualTo("UNKNOWN");
        assertThat(g.signals()).anySatisfy(s -> {
            assertThat(s.kind()).isEqualTo("SPREAD");
            assertThat(s.focus()).containsExactly("need:ELDER");
        });
    }

    @Test
    void 멈춘_시도는_장벽_노드와_장벽_해결_신호를_만든다() {
        Instant past = Instant.now().minus(90, ChronoUnit.DAYS);
        Card c = cards.save(new Card(Ids.newId(), "광운대 앞 주말 플리마켓", "광운로에서 주말마다 학생과 주민이 플리마켓을 열어요.", "", "광운로", "",
                "kg-test", "홍길동", past, past.plus(14, ChronoUnit.DAYS)));
        c.conclude(Decision.HOLD);
        cards.save(c);
        conclusions.save(new Conclusion(Ids.newId(), c.getId(), Decision.HOLD, List.of("운영 주체 없음"), "운영할 팀이 없어요.", "kg-test"));

        var g = knowledge.graph();
        assertThat(node(g, c.getId()).state()).isEqualTo("STOPPED");
        assertThat(g.links()).extracting(l -> l.source() + ">" + l.target()).contains(c.getId() + ">barrier:운영 주체 없음", c.getId() + ">actor:" + Ontology.RESIDENT_ACTOR);
        assertThat(g.nodes()).extracting(KnowledgeGraphService.GraphNode::label).doesNotContain("홍길동");
        assertThat(g.signals()).anySatisfy(s -> {
            assertThat(s.kind()).isEqualTo("STALLED");
            assertThat(s.focus()).containsExactly("need:MARKET", "place:KW_UNIV");
            assertThat(s.detail()).contains("운영 주체 없음");
        });
    }

    @Test
    void 대상_사전은_본문에서_수혜자를_찾고_시도_없는_문제는_빈칸이다() {
        assertThat(Ontology.beneficiaries("홀몸 어르신 반찬 배달", "원룸 혼밥 대학생")).extracting(Ontology.Beneficiary::key)
                .contains("ELDER", "SOLO", "YOUTH");
        var g = knowledge.graph();
        assertThat(g.signals()).filteredOn(s -> s.kind().equals("WHITESPACE")).extracting(KnowledgeGraphService.Signal::title)
                .allSatisfy(title -> assertThat(g.nodes()).extracting(KnowledgeGraphService.GraphNode::label).doesNotContain(title));
    }
}
