package com.wolgyehoek.dongnae.ideas;

import com.wolgyehoek.dongnae.assist.Similarity;
import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.conclusion.Conclusion;
import com.wolgyehoek.dongnae.conclusion.ConclusionRepository;
import com.wolgyehoek.dongnae.ideas.IdeaTaxonomy.Concept;
import com.wolgyehoek.dongnae.ideas.IdeaTaxonomy.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class IdeaGraphService {

    private static final int RELATED_LIMIT = 6;
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final Map<String, String> ORIGIN_LABELS = Map.of(
            "STUDENT", "학생 프로젝트", "POLICY", "구·시 사업", "RESIDENT", "주민 제안", "PLEDGE", "선거 공약",
            "ORDINANCE", "조례", "COUNCIL", "의회 기록");

    public record Label(String key, String label) {
    }

    public record Related(String id, String title, String status, String statusLabel, int year, String origin,
                          String originLabel, String sourceTitle, String sourceUrl, String zone, List<String> shared,
                          String decision, List<String> reasonTags, String reason, boolean succeeded,
                          boolean canTakeOver, double score, String by) {
    }

    public record Reason(String tag, long count) {
    }

    public record Outcome(int attempts, int stopped, int going, int open, List<Reason> reasons, Integer since) {
    }

    public record Check(List<Label> concepts, Label zone, String topic, List<Related> related, Outcome outcome) {
    }

    public record Cell(String zone, String topic, int count, int stopped, int going, int open, List<String> ids) {
    }

    public record Cluster(String concept, String conceptLabel, String zone, String zoneLabel, String topic,
                          Outcome outcome, List<Related> ideas) {
    }

    public record IdeaMap(List<Label> zones, List<Cell> cells, List<Cluster> clusters, int total) {
    }

    record Node(Card card, Profile profile, Set<String> grams, Conclusion latest, CardStatus status, int year) {
        boolean archivedWithoutOutcome() {
            return latest == null && !card.getOrigin().isEmpty();
        }

        boolean stopped() {
            if (archivedWithoutOutcome()) return false;
            return status == CardStatus.HOLD || status == CardStatus.STOP || status == CardStatus.STALE;
        }

        boolean going() {
            return card.getSucceededAt() != null || status == CardStatus.GO;
        }
    }

    private final CardRepository cards;
    private final ConclusionRepository conclusions;

    public IdeaGraphService(CardRepository cards, ConclusionRepository conclusions) {
        this.cards = cards;
        this.conclusions = conclusions;
    }

    public Check check(String title, String problem, String body, String place, String topic) {
        Profile profile = IdeaTaxonomy.classify(title, problem, body, place, topic);
        return checkAgainst(profile, Similarity.bigrams(nz(title) + nz(problem) + nz(body)), nodes(), null);
    }

    public Check related(String cardId) {
        List<Node> all = nodes();
        Node self = all.stream().filter(n -> n.card().getId().equals(cardId)).findFirst()
                .orElseThrow(() -> new CardNotFoundException(cardId));
        return checkAgainst(self.profile(), self.grams(), all, cardId);
    }

    public IdeaMap map() {
        List<Node> all = nodes();
        Map<String, List<Node>> byCell = all.stream().filter(n -> !n.profile().topic().isEmpty())
                .collect(Collectors.groupingBy(n -> n.profile().zone().key() + "|" + n.profile().topic()));
        List<Cell> cells = byCell.entrySet().stream().map(e -> {
            String[] k = e.getKey().split("\\|");
            Outcome o = outcome(e.getValue());
            return new Cell(k[0], k[1], o.attempts(), o.stopped(), o.going(), o.open(),
                    e.getValue().stream().map(n -> n.card().getId()).toList());
        }).toList();

        Map<String, List<Node>> byCluster = new LinkedHashMap<>();
        for (Node n : all) {
            n.profile().lead().ifPresent(c -> byCluster.computeIfAbsent(c.key() + "|" + n.profile().zone().key(), k -> new ArrayList<>()).add(n));
        }
        Map<String, Concept> concepts = IdeaTaxonomy.CONCEPTS.stream().collect(Collectors.toMap(Concept::key, Function.identity()));
        List<Cluster> clusters = byCluster.entrySet().stream()
                .filter(e -> e.getValue().size() >= 2)
                .map(e -> {
                    String[] k = e.getKey().split("\\|");
                    Concept c = concepts.get(k[0]);
                    List<Node> members = e.getValue().stream().sorted(Comparator.comparingInt(Node::year)).toList();
                    return new Cluster(c.key(), c.label(), k[1], IdeaTaxonomy.zone(k[1]).label(), c.topic(), outcome(members),
                            members.stream().map(n -> related(n, Set.of(), 1)).toList());
                })
                .sorted(Comparator.comparingInt((Cluster c) -> c.outcome().attempts()).reversed()
                        .thenComparing(Comparator.comparingInt((Cluster c) -> c.outcome().stopped()).reversed()))
                .toList();
        List<Label> zones = IdeaTaxonomy.ZONES.stream().map(z -> new Label(z.key(), z.label())).toList();
        return new IdeaMap(zones, cells, clusters, all.size());
    }

    private Check checkAgainst(Profile profile, Set<String> grams, List<Node> all, String excludeId) {
        record Scored(Node node, Set<String> shared, double score) {
        }
        List<Scored> scored = all.stream()
                .filter(n -> !n.card().getId().equals(excludeId))
                .map(n -> {
                    Set<String> shared = new HashSet<>(profile.conceptKeys());
                    shared.retainAll(n.profile().conceptKeys());
                    return new Scored(n, shared, score(profile, grams, n, shared));
                })
                .filter(s -> s.score() > 0)
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .limit(RELATED_LIMIT)
                .toList();
        List<Related> related = scored.stream().map(s -> related(s.node(), s.shared(), s.score())).toList();
        return new Check(profile.concepts().stream().map(c -> new Label(c.key(), c.label())).toList(),
                new Label(profile.zone().key(), profile.zone().label()), profile.topic(), related,
                outcome(scored.stream().map(Scored::node).toList()));
    }

    /** 같은 개념을 같은 구역(또는 동 전역)에서 다루거나, 문장이 충분히 겹치면 같은 묶음으로 본다. 아니면 0. */
    private static double score(Profile p, Set<String> grams, Node n, Set<String> shared) {
        double text = Similarity.jaccard(grams, n.grams());
        Set<String> union = new HashSet<>(p.conceptKeys());
        union.addAll(n.profile().conceptKeys());
        long specific = p.concepts().stream().filter(c -> !c.broad() && shared.contains(c.key())).count();
        boolean sameZone = p.zone().equals(n.profile().zone()) && !IdeaTaxonomy.isWide(p.zone());
        boolean zoneFits = sameZone || IdeaTaxonomy.isWide(p.zone()) || IdeaTaxonomy.isWide(n.profile().zone());
        boolean linked = text >= 0.25
                || (specific >= 1 && (zoneFits || text >= 0.1))
                || (shared.size() >= 2 && zoneFits)
                || (!shared.isEmpty() && zoneFits && p.topic().equals(n.profile().topic()));
        if (!linked) return 0;
        double concept = union.isEmpty() ? 0 : (double) shared.size() / union.size();
        return Math.min(1, 0.55 * concept + (sameZone ? 0.2 : 0) + 0.6 * text);
    }

    static Outcome outcome(List<Node> nodes) {
        int stopped = (int) nodes.stream().filter(Node::stopped).count();
        int going = (int) nodes.stream().filter(n -> !n.stopped() && n.going()).count();
        List<Reason> reasons = nodes.stream().filter(Node::stopped).map(Node::latest).filter(Objects::nonNull)
                .flatMap(c -> c.getReasonTags().stream())
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
                .entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> new Reason(e.getKey(), e.getValue())).toList();
        Integer since = nodes.stream().map(Node::year).min(Integer::compare).orElse(null);
        return new Outcome(nodes.size(), stopped, going, nodes.size() - stopped - going, reasons, since);
    }

    private static Related related(Node n, Set<String> shared, double score) {
        Card c = n.card();
        Conclusion latest = n.latest();
        List<String> sharedLabels = n.profile().concepts().stream().filter(k -> shared.contains(k.key())).map(Concept::label).toList();
        String status = n.archivedWithoutOutcome() ? "UNKNOWN" : n.status().name();
        String statusLabel = n.archivedWithoutOutcome() ? "결과 미확인"
                : !c.getOrigin().isEmpty() && n.status() == CardStatus.GO ? "시행" : n.status().getLabel();
        return new Related(c.getId(), c.getTitle(), status, statusLabel, n.year(), c.getOrigin(),
                ORIGIN_LABELS.getOrDefault(c.getOrigin(), "동네서랍"), c.getSourceTitle(), c.getSourceUrl(),
                n.profile().zone().label(), sharedLabels, latest == null ? null : latest.getDecision().name(),
                latest == null ? List.of() : latest.getReasonTags(), latest == null ? "" : latest.getReason(),
                c.getSucceededAt() != null, n.status().canTakeOver(), Math.round(score * 100) / 100.0,
                c.getOrigin().isEmpty() ? "" : c.getProposerName());
    }

    List<Node> nodes() {
        Instant now = Instant.now();
        List<Card> visible = cards.findByHiddenFalse();
        Map<String, Conclusion> latest = new HashMap<>();
        for (Card c : visible) {
            List<Conclusion> history = conclusions.findByCardIdOrderByCreatedAtDesc(c.getId());
            if (!history.isEmpty()) latest.put(c.getId(), history.getFirst());
        }
        return visible.stream().map(c -> new Node(c,
                IdeaTaxonomy.classify(c.getTitle(), c.getProblem(), c.getBody(), c.getPlace(), c.getTopic()),
                Similarity.bigrams(nz(c.getTitle()) + nz(c.getProblem()) + nz(c.getBody())),
                latest.get(c.getId()), c.status(now),
                c.getSourceYear() != null ? c.getSourceYear() : c.getCreatedAt().atZone(SEOUL).getYear())).toList();
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
