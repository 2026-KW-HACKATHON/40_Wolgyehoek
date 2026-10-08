package com.wolgyehoek.dongnae.views;

import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.conclusion.*;
import com.wolgyehoek.dongnae.device.*;
import com.wolgyehoek.dongnae.media.*;
import com.wolgyehoek.dongnae.notice.*;
import com.wolgyehoek.dongnae.opinion.*;
import com.wolgyehoek.dongnae.reaction.*;
import com.wolgyehoek.dongnae.report.*;
import com.wolgyehoek.dongnae.institution.InstitutionService;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/views")
@Transactional(readOnly = true)
public class ViewsController {
    private final CardRepository cards;
    private final ReactionRepository reactions;
    private final OpinionRepository opinions;
    private final ConclusionRepository conclusions;
    private final DeviceService devices;
    private final ReportService reports;
    private final NoticeService notices;
    private final com.wolgyehoek.dongnae.credits.CreditService credits;
    private final MediaService media;
    private final NamedParameterJdbcTemplate sql;
    private final InstitutionService institutions;

    public ViewsController(CardRepository cards, ReactionRepository reactions, OpinionRepository opinions,
                           ConclusionRepository conclusions, DeviceService devices, ReportService reports, NoticeService notices, com.wolgyehoek.dongnae.credits.CreditService credits, MediaService media,
                           NamedParameterJdbcTemplate sql, InstitutionService institutions) {
        this.cards = cards; this.reactions = reactions; this.opinions = opinions;
        this.conclusions = conclusions; this.devices = devices; this.reports = reports; this.notices = notices; this.credits = credits; this.media = media;
        this.sql = sql;
        this.institutions = institutions;
    }

    public record CardView(String id, String title, String body, String target, String place, String effect,
                           String proposerName, Instant startsAt, Instant endsAt, String parentId, String takeoverNote,
                           boolean isSeed, boolean hidden, Instant reportPublishedAt, String reportSummary, Instant createdAt,
                           List<MediaView> media, int goal, Instant succeededAt, String successNote, long pledges,
                           String problem, String topic, String origin, String sourceTitle, String sourceUrl, Integer sourceYear) {}
    public record Summary(CardView card, CardStatus status, int reactionCount, int opinionCount, ConclusionResponse latest) {}
    public record Detail(Summary summary, ReportViewResponse validation, List<OpinionResponse> opinions,
                         List<ConclusionResponse> conclusions, CardView parent, List<CardView> children,
                         List<InstitutionService.Response> institutionResponses) {}
    public record Activity(List<Summary> mine, List<Summary> joined, List<NoticeResponse> notices) {}

    private CardView view(Card c) {
        return view(c, media.forCard(c.getId()), credits.pledgeCount(c.getId()));
    }
    private CardView view(Card c, List<MediaView> files, long pledges) {
        return new CardView(c.getId(), c.getTitle(), c.getBody(), c.getTarget(), c.getPlace(), c.getEffect(),
                c.getProposerName(), c.getStartsAt(), c.getEndsAt(), c.getParentId(), c.getTakeoverNote(),
                c.isSeed(), c.isHidden(), c.getReportPublishedAt(), c.getReportSummary(), c.getCreatedAt(),
                files, c.getGoal(), c.getSucceededAt(), c.getSuccessNote(), pledges,
                c.getProblem(), c.getTopic(), c.getOrigin(), c.getSourceTitle(), c.getSourceUrl(), c.getSourceYear());
    }
    private Summary summary(Card c) {
        var history = conclusions.findByCardIdOrderByCreatedAtDesc(c.getId());
        return new Summary(view(c), c.status(Instant.now()), reactions.findByCardId(c.getId()).size(),
                opinions.findByCardIdAndHiddenFalseOrderByCreatedAtDesc(c.getId()).size(),
                history.isEmpty() ? null : ConclusionResponse.from(history.getFirst()));
    }

    // 목록은 카드마다 5번씩 쿼리하면 DB 왕복 지연이 카드 수만큼 쌓이므로, 연관 데이터를 카드 묶음 단위로 한 번에 읽는다.
    private List<Summary> summaries(Stream<Card> stream) {
        List<Card> list = stream.filter(c -> !c.isHidden()).sorted(Comparator.comparing(Card::getCreatedAt).reversed()).toList();
        if (list.isEmpty()) return List.of();
        var ids = Map.of("ids", list.stream().map(Card::getId).toList());
        Map<String, List<MediaView>> files = new HashMap<>();
        sql.query("SELECT card_id, id, kind, content_type FROM card_media WHERE card_id IN (:ids) ORDER BY position", ids, rs -> {
            files.computeIfAbsent(rs.getString("card_id"), k -> new ArrayList<>())
                    .add(new MediaView(rs.getString("id"), rs.getString("kind"), rs.getString("content_type")));
        });
        var pledges = counts("SELECT card_id, count(*) AS n FROM idea_swipes WHERE direction = 'RIGHT' AND card_id IN (:ids) GROUP BY card_id", ids);
        var reactionCounts = counts("SELECT card_id, count(*) AS n FROM reactions WHERE card_id IN (:ids) GROUP BY card_id", ids);
        var opinionCounts = counts("SELECT card_id, count(*) AS n FROM opinions WHERE NOT hidden AND card_id IN (:ids) GROUP BY card_id", ids);
        Map<String, Conclusion> latest = new HashMap<>();
        conclusions.findByCardIdInOrderByCreatedAtDesc(ids.get("ids")).forEach(x -> latest.putIfAbsent(x.getCardId(), x));
        Instant now = Instant.now();
        return list.stream().map(c -> new Summary(
                view(c, files.getOrDefault(c.getId(), List.of()), pledges.getOrDefault(c.getId(), 0L)), c.status(now),
                reactionCounts.getOrDefault(c.getId(), 0L).intValue(), opinionCounts.getOrDefault(c.getId(), 0L).intValue(),
                latest.containsKey(c.getId()) ? ConclusionResponse.from(latest.get(c.getId())) : null)).toList();
    }
    private Map<String, Long> counts(String query, Map<String, ?> params) {
        Map<String, Long> out = new HashMap<>();
        sql.query(query, params, rs -> { out.put(rs.getString("card_id"), rs.getLong("n")); });
        return out;
    }

    @GetMapping("/cards")
    public List<Summary> list(@RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "all") String tab) {
        String query = q.trim().toLowerCase(Locale.ROOT);
        return summaries(cards.findByHiddenFalse().stream()
                .filter(c -> query.isEmpty() || (c.getTitle() + " " + c.getBody() + " " + c.getPlace()).toLowerCase(Locale.ROOT).contains(query))
                .filter(c -> tab.equals("all") || (tab.equals("open") ? c.isOpen(Instant.now()) : !c.isOpen(Instant.now()))));
    }

    @Transactional
    @GetMapping("/cards/{id}")
    public Detail detail(@PathVariable String id, @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        DeviceInfo me = devices.getOrCreate(deviceId);
        Card c = cards.findById(id).filter(card -> !card.isHidden() || me.operator())
                .orElseThrow(() -> new CardNotFoundException(id));
        CardView parent = c.getParentId() == null ? null : cards.findById(c.getParentId())
                .filter(p -> !p.isHidden()).map(this::view).orElse(null);
        var children = cards.findByParentId(id).stream().filter(child -> !child.isHidden()).map(this::view).toList();
        return new Detail(summary(c), reports.view(id, me),
                opinions.findByCardIdAndHiddenFalseOrderByCreatedAtDesc(id).stream().map(OpinionResponse::from).toList(),
                conclusions.findByCardIdOrderByCreatedAtDesc(id).stream().map(ConclusionResponse::from).toList(), parent, children,
                institutions.responses(id));
    }

    @GetMapping("/me")
    public Activity activity(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        Set<String> ids = new HashSet<>(credits.joinedCardIds(deviceId));
        reactions.findByDeviceId(deviceId).forEach(r -> ids.add(r.getCardId()));
        opinions.findByDeviceId(deviceId).forEach(o -> ids.add(o.getCardId()));
        return new Activity(summaries(cards.findByProposerIdOrderByCreatedAtDesc(deviceId).stream()),
                summaries(cards.findAllById(ids).stream()), notices.list(deviceId));
    }
}
