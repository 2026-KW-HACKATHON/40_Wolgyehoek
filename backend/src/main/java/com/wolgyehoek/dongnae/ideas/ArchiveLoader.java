package com.wolgyehoek.dongnae.ideas;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Set;

@Component
public class ArchiveLoader implements ApplicationRunner {

    public static final String RESOURCE = "ideas/archive.json";

    public record ArchiveRecord(String id, int year, String origin, String by, String title, String problem,
                                String body, String place, String topic, String outcome, List<String> reasonTags,
                                String reason, String sourceTitle, String sourceUrl) {
    }

    private static final Set<String> DECISIONS = Set.of("GO", "HOLD", "STOP");

    private final JdbcTemplate db;
    private final JsonMapper json;
    private final boolean enabled;

    public ArchiveLoader(JdbcTemplate db, JsonMapper json, @Value("${dongnae.archive-seed:false}") boolean enabled) {
        this.db = db;
        this.json = json;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (enabled) load();
    }

    @Transactional
    public int load() {
        int added = 0;
        for (ArchiveRecord r : records()) {
            int inserted = db.update("""
                    INSERT INTO cards(id,title,body,target,place,effect,proposer_id,proposer_name,starts_at,ends_at,is_seed,
                                      problem,topic,origin,source_title,source_url,source_year)
                    VALUES (?,?,?,'',?,'','archive',?,make_timestamptz(?,1,1,0,0,0,'Asia/Seoul'),
                            LEAST(make_timestamptz(?,12,31,0,0,0,'Asia/Seoul'), now() - interval '60 days'),false,?,?,?,?,?,?)
                    ON CONFLICT (id) DO NOTHING
                    """, r.id(), r.title(), r.body(), r.place(), r.by(), r.year(), r.year(), r.problem(), r.topic(),
                    r.origin(), r.sourceTitle(), r.sourceUrl(), r.year());
            if (inserted == 1 && DECISIONS.contains(r.outcome())) {
                db.update(con -> {
                    var ps = con.prepareStatement("""
                            INSERT INTO conclusions(id,card_id,decision,reason_tags,reason,decided_by,created_at)
                            VALUES (?,?,?,?,?,'archive',make_timestamptz(?,12,31,0,0,0,'Asia/Seoul'))
                            """);
                    ps.setString(1, r.id() + "-end");
                    ps.setString(2, r.id());
                    ps.setString(3, r.outcome());
                    ps.setArray(4, con.createArrayOf("text", r.reasonTags() == null ? new String[0] : r.reasonTags().toArray(String[]::new)));
                    ps.setString(5, r.reason() == null ? "" : r.reason());
                    ps.setInt(6, r.year());
                    return ps;
                });
                db.update("UPDATE cards SET latest_decision=? WHERE id=?", r.outcome(), r.id());
            }
            added += inserted;
        }
        return added;
    }

    public List<ArchiveRecord> records() {
        try (InputStream in = new ClassPathResource(RESOURCE).getInputStream()) {
            return json.readValue(in, json.getTypeFactory().constructCollectionType(List.class, ArchiveRecord.class));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
