package com.wolgyehoek.dongnae.views;

import com.wolgyehoek.dongnae.card.*;
import com.wolgyehoek.dongnae.conclusion.*;
import com.wolgyehoek.dongnae.device.*;
import com.wolgyehoek.dongnae.media.*;
import com.wolgyehoek.dongnae.notice.*;
import com.wolgyehoek.dongnae.opinion.*;
import com.wolgyehoek.dongnae.reaction.*;
import com.wolgyehoek.dongnae.report.*;
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

    public ViewsController(CardRepository cards, ReactionRepository reactions, OpinionRepository opinions,
                           ConclusionRepository conclusions, DeviceService devices, ReportService reports, NoticeService notices, com.wolgyehoek.dongnae.credits.CreditService credits, MediaService media) {
        this.cards = cards; this.reactions = reactions; this.opinions = opinions;
        this.conclusions = conclusions; this.devices = devices; this.reports = reports; this.notices = notices; this.credits = credits; this.media = media;
    }

    public record CardView(String id, String title, String body, String target, String place, String effect,
                           String proposerName, Instant startsAt, Instant endsAt, String parentId, String takeoverNote,
                           boolean isSeed, boolean hidden, Instant reportPublishedAt, String reportSummary, Instant createdAt,
                           List<MediaView> media, int goal, Instant succeededAt, String successNote, long pledges,
                           String problem, String topic, String origin, String sourceTitle, String sourceUrl, Integer sourceYear) {}
    public record Summary(CardView card, CardStatus status, int reactionCount, int opinionCount, ConclusionResponse latest) {}
    public record Detail(Summary summary, ReportViewResponse validation, List<OpinionResponse> opinions,
                         List<ConclusionResponse> conclusions, CardView parent, List<CardView> children) {}
    public record Activity(List<Summary> mine, List<Summary> joined, List<NoticeResponse> notices) {}

    private CardView view(Card c) {
        return new CardView(c.getId(), c.getTitle(), c.getBody(), c.getTarget(), c.getPlace(), c.getEffect(),
                c.getProposerName(), c.getStartsAt(), c.getEndsAt(), c.getParentId(), c.getTakeoverNote(),
                c.isSeed(), c.isHidden(), c.getReportPublishedAt(), c.getReportSummary(), c.getCreatedAt(),
                media.forCard(c.getId()), c.getGoal(), c.getSucceededAt(), c.getSuccessNote(), credits.pledgeCount(c.getId()),
                c.getProblem(), c.getTopic(), c.getOrigin(), c.getSourceTitle(), c.getSourceUrl(), c.getSourceYear());
    }
    private Summary summary(Card c) {
        var history = conclusions.findByCardIdOrderByCreatedAtDesc(c.getId());
        return new Summary(view(c), c.status(Instant.now()), reactions.findByCardId(c.getId()).size(),
                opinions.findByCardIdAndHiddenFalseOrderByCreatedAtDesc(c.getId()).size(),
                history.isEmpty() ? null : ConclusionResponse.from(history.getFirst()));
    }
    private List<Summary> summaries(Stream<Card> stream) {
        return stream.filter(c -> !c.isHidden()).sorted(Comparator.comparing(Card::getCreatedAt).reversed())
                .map(this::summary).toList();
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
                conclusions.findByCardIdOrderByCreatedAtDesc(id).stream().map(ConclusionResponse::from).toList(), parent, children);
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
