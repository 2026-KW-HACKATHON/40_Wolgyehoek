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
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class IdeaGraphServiceTest {

    @Autowired ArchiveLoader archive;
    @Autowired IdeaGraphService graph;
    @Autowired CardRepository cards;
    @Autowired ConclusionRepository conclusions;
    @Autowired JdbcTemplate db;

    @BeforeEach
    void loadArchive() {
        archive.load();
    }

    @Test
    void 공개_기록은_한_번만_적재되고_출처와_결론을_남긴다() {
        assertThat(archive.load()).isZero();
        assertThat(db.queryForObject("SELECT count(*) FROM cards WHERE origin<>'' AND source_url LIKE 'https://%'", Integer.class))
                .isEqualTo(archive.records().size());
        assertThat(db.queryForObject("SELECT latest_decision FROM cards WHERE id='arc_meal24'", String.class)).isEqualTo("GO");
        assertThat(db.queryForObject("SELECT latest_decision FROM cards WHERE id='arc_pest21'", String.class)).isNull();
    }

    @Test
    void 새_아이디어를_쓰면_같은_묶음의_지난_시도를_찾고_결과_미확인은_멈춤으로_세지_않는다() {
        var check = graph.check("홀몸 어르신 안부 전화", "홀몸 어르신이 고립돼요", "대학생이 매주 홀몸 어르신께 안부 전화를 드려요", "월계1동", "");
        List<String> ids = check.related().stream().map(IdeaGraphService.Related::id).toList();
        assertThat(ids).contains("arc_ai24");
        assertThat(check.outcome().attempts()).isGreaterThanOrEqualTo(3);
        assertThat(check.outcome().stopped()).isZero();
        assertThat(check.concepts()).extracting(IdeaGraphService.Label::key).contains("ELDER");
    }

    @Test
    void 멈춘_시도의_이유를_모아_보여준다() {
        Instant past = Instant.now().minus(90, ChronoUnit.DAYS);
        Card c = cards.save(new Card(Ids.newId(), "광운로 주말 플리마켓", "광운로에서 주말마다 주민 플리마켓을 열어요.", "", "광운로", "",
                "graph-test", "테스트", past, past.plus(14, ChronoUnit.DAYS)));
        c.conclude(Decision.HOLD);
        cards.save(c);
        conclusions.save(new Conclusion(Ids.newId(), c.getId(), Decision.HOLD, List.of("운영 주체 없음"), "운영할 팀이 없어요.", "graph-test"));

        var check = graph.check("광운대 앞 플리마켓", "", "학생과 주민이 함께 여는 플리마켓", "광운대 정문", "");
        assertThat(check.related()).extracting(IdeaGraphService.Related::id).contains(c.getId(), "arc_flea19");
        assertThat(check.outcome().reasons()).extracting(IdeaGraphService.Reason::tag).contains("운영 주체 없음");
    }

    @Test
    void 지도는_구역과_분야의_칸_그리고_두_번_이상_나온_묶음을_돌려준다() {
        var map = graph.map();
        assertThat(map.cells()).anySatisfy(cell -> assertThat(cell.ids()).contains("arc_meal24"));
        assertThat(map.clusters()).anySatisfy(cluster -> {
            assertThat(cluster.concept()).isEqualTo("ELDER");
            assertThat(cluster.outcome().attempts()).isGreaterThanOrEqualTo(5);
        });
        assertThat(graph.related("arc_flea22").related()).extracting(IdeaGraphService.Related::id).contains("arc_flea19");
    }
}
