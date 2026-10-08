package com.wolgyehoek.dongnae.ideas;

import com.wolgyehoek.dongnae.card.Card;
import com.wolgyehoek.dongnae.card.CardStatus;
import com.wolgyehoek.dongnae.ideas.IdeaGraphService.Node;
import com.wolgyehoek.dongnae.ideas.IdeaGraphService.Outcome;
import com.wolgyehoek.dongnae.ideas.IdeaTaxonomy.Concept;
import com.wolgyehoek.dongnae.ideas.IdeaTaxonomy.Zone;
import com.wolgyehoek.dongnae.ideas.Ontology.NodeType;
import com.wolgyehoek.dongnae.ideas.Ontology.Relation;
import com.wolgyehoek.dongnae.ideas.Ontology.State;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class KnowledgeGraphService {

    public record Stats(int attempts, int going, int stopped, int live, int unknown, int demand,
                        Integer since, Integer until, List<IdeaGraphService.Reason> reasons) {
    }

    public record GraphNode(String id, String type, String label, String sub, String state, int year,
                            String href, String sourceUrl, Stats stats) {
    }

    public record GraphLink(String source, String target, String type) {
    }

    public record Signal(String kind, String label, String title, String detail, int score, List<String> focus) {
    }

    public record Graph(List<GraphNode> nodes, List<GraphLink> links, List<Signal> signals,
                        Map<String, String> types, int ideas) {
    }

    private record Idea(Node node, State state, String actor, List<Ontology.Beneficiary> beneficiaries,
                        List<String> barriers, int demand) {
        Card card() {
            return node.card();
        }
    }

    private final IdeaGraphService ideas;
    private final JdbcTemplate db;

    public KnowledgeGraphService(IdeaGraphService ideas, JdbcTemplate db) {
        this.ideas = ideas;
        this.db = db;
    }

    public Graph graph() {
        Map<String, Integer> demand = demand();
        List<Idea> all = ideas.nodes().stream().map(n -> idea(n, demand.getOrDefault(n.card().getId(), 0))).toList();
        Map<String, List<Idea>> members = new LinkedHashMap<>();
        Map<String, GraphNode> hubs = new LinkedHashMap<>();
        List<GraphLink> links = new ArrayList<>();
        List<GraphNode> ideaNodes = new ArrayList<>();
        Set<String> ids = all.stream().map(i -> i.card().getId()).collect(Collectors.toSet());

        for (Idea i : all) {
            Card c = i.card();
            ideaNodes.add(new GraphNode(c.getId(), NodeType.IDEA.name(), c.getTitle(), i.node().profile().zone().label(),
                    i.state().name(), i.node().year(), "/cards/" + c.getId(), c.getSourceUrl(), null));
            for (Concept k : i.node().profile().concepts()) link(i, "need:" + k.key(), NodeType.NEED, k.label(), k.topic(), Relation.ADDRESSES, hubs, members, links);
            Zone z = i.node().profile().zone();
            link(i, "place:" + z.key(), NodeType.PLACE, z.label(), "", Relation.LOCATED_IN, hubs, members, links);
            link(i, "actor:" + i.actor(), NodeType.ACTOR, i.actor(), Ontology.actorKind(i.actor()), Relation.LED_BY, hubs, members, links);
            for (Ontology.Beneficiary b : i.beneficiaries()) link(i, "ben:" + b.key(), NodeType.BENEFICIARY, b.label(), "", Relation.SERVES, hubs, members, links);
            for (String tag : i.barriers()) link(i, "barrier:" + tag, NodeType.BARRIER, tag, "", Relation.BLOCKED_BY, hubs, members, links);
            if (!c.getSourceUrl().isEmpty()) link(i, "source:" + c.getSourceUrl(), NodeType.SOURCE, c.getSourceTitle(), "", Relation.CITES, hubs, members, links);
            if (c.getParentId() != null && ids.contains(c.getParentId())) links.add(new GraphLink(c.getId(), c.getParentId(), Relation.CONTINUES.name()));
        }

        List<GraphNode> nodes = new ArrayList<>(ideaNodes);
        hubs.forEach((id, h) -> nodes.add(new GraphNode(id, h.type(), h.label(), h.sub(), null, 0, null, h.sourceUrl(), stats(members.get(id)))));
        Map<String, String> types = new LinkedHashMap<>();
        for (NodeType t : NodeType.values()) types.put(t.name(), t.label());
        return new Graph(nodes, links, signals(all), types, all.size());
    }

    private static void link(Idea i, String hubId, NodeType type, String label, String sub, Relation rel,
                             Map<String, GraphNode> hubs, Map<String, List<Idea>> members, List<GraphLink> links) {
        hubs.computeIfAbsent(hubId, k -> new GraphNode(k, type.name(), label, sub, null, 0, null,
                type == NodeType.SOURCE ? hubId.substring("source:".length()) : "", null));
        List<Idea> list = members.computeIfAbsent(hubId, k -> new ArrayList<>());
        if (!list.contains(i)) {
            list.add(i);
            links.add(new GraphLink(i.card().getId(), hubId, rel.name()));
        }
    }

    private Idea idea(Node n, int demand) {
        Card c = n.card();
        State state = n.going() ? State.GOING : n.stopped() ? State.STOPPED
                : n.status() == CardStatus.OPEN && c.getOrigin().isEmpty() ? State.LIVE : State.UNKNOWN;
        List<String> barriers = state == State.STOPPED && n.latest() != null ? n.latest().getReasonTags() : List.of();
        return new Idea(n, state, Ontology.actor(c.getOrigin(), c.getProposerName(), c.isSeed()),
                Ontology.beneficiaries(c.getTitle(), c.getProblem(), c.getBody(), c.getTarget()), barriers, demand);
    }

    private Map<String, Integer> demand() {
        Map<String, Integer> out = new HashMap<>();
        for (String sql : List.of("SELECT card_id, count(*) AS n FROM reactions GROUP BY card_id",
                "SELECT card_id, count(*) AS n FROM idea_swipes WHERE direction='RIGHT' GROUP BY card_id")) {
            db.query(sql, rs -> {
                out.merge(rs.getString("card_id"), rs.getInt("n"), Integer::sum);
            });
        }
        return out;
    }

    private static Stats stats(List<Idea> list) {
        Outcome o = IdeaGraphService.outcome(list.stream().map(Idea::node).toList());
        int live = (int) list.stream().filter(i -> i.state() == State.LIVE).count();
        int unknown = (int) list.stream().filter(i -> i.state() == State.UNKNOWN).count();
        Integer until = list.stream().map(i -> i.node().year()).max(Integer::compare).orElse(null);
        return new Stats(o.attempts(), o.going(), o.stopped(), live, unknown, list.stream().mapToInt(Idea::demand).sum(),
                o.since(), until, o.reasons());
    }

    private static List<Signal> signals(List<Idea> all) {
        List<Signal> out = new ArrayList<>();
        Map<String, List<Idea>> byNeed = new LinkedHashMap<>();
        Map<String, List<Idea>> byCell = new LinkedHashMap<>();
        for (Idea i : all) {
            for (Concept k : i.node().profile().concepts()) {
                byNeed.computeIfAbsent(k.key(), x -> new ArrayList<>()).add(i);
                byCell.computeIfAbsent(k.key() + "|" + i.node().profile().zone().key(), x -> new ArrayList<>()).add(i);
            }
        }
        Map<String, Concept> concepts = IdeaTaxonomy.CONCEPTS.stream().collect(Collectors.toMap(Concept::key, c -> c));

        byNeed.forEach((key, list) -> {
            Concept k = concepts.get(key);
            int demand = list.stream().mapToInt(Idea::demand).sum();
            long going = list.stream().filter(i -> i.state() == State.GOING).count();
            if (demand > 0 && going == 0) {
                out.add(new Signal("DEMAND", "수요 미충족", k.label() + "에 " + demand + "명이 반응했어요",
                        "아직 시행된 시도가 없어요 · " + list.size() + "번 시도", 70 + demand, List.of("need:" + key)));
            }
            Set<String> proven = list.stream().filter(i -> i.state() == State.GOING).map(i -> i.node().profile().zone()).filter(z -> z != IdeaTaxonomy.WIDE).map(Zone::label).collect(Collectors.toCollection(LinkedHashSet::new));
            Set<String> tried = list.stream().map(i -> i.node().profile().zone().key()).collect(Collectors.toSet());
            List<String> empty = IdeaTaxonomy.ZONES.stream().filter(z -> z != IdeaTaxonomy.WIDE && !tried.contains(z.key())).map(Zone::label).toList();
            if (!proven.isEmpty() && !empty.isEmpty()) {
                out.add(new Signal("SPREAD", "확산", k.label() + " · " + String.join(", ", proven) + "에서 시행",
                        String.join(", ", empty.subList(0, Math.min(3, empty.size()))) + (empty.size() > 3 ? " 외 " + (empty.size() - 3) + "곳" : "") + "은 아직 시도 없음",
                        45 + (int) Math.min(going, 5) * 5, List.of("need:" + key)));
            }
        });

        byCell.forEach((cell, list) -> {
            String[] p = cell.split("\\|");
            Concept k = concepts.get(p[0]);
            Zone z = IdeaTaxonomy.zone(p[1]);
            String name = k.label() + " · " + z.label();
            List<String> focus = List.of("need:" + p[0], "place:" + p[1]);
            long stopped = list.stream().filter(i -> i.state() == State.STOPPED).count();
            long going = list.stream().filter(i -> i.state() == State.GOING).count();
            long unknown = list.stream().filter(i -> i.state() == State.UNKNOWN).count();
            if (stopped > 0 && list.size() >= 2) {
                String barriers = list.stream().flatMap(i -> i.barriers().stream()).distinct().collect(Collectors.joining(", "));
                out.add(new Signal("STALLED", "재도전 기회", name, list.size() + "번 시도 · " + stopped + "번 멈춤" + (barriers.isEmpty() ? "" : " · " + barriers),
                        60 + (int) stopped * 10 + list.size() * 3, focus));
            }
            if (unknown >= 2 && going == 0 && stopped == 0) {
                out.add(new Signal("UNVERIFIED", "결과 미확인", name, unknown + "번 나왔지만 결과가 남지 않았어요", 40 + (int) unknown * 5, focus));
            }
            if (going >= 3) {
                out.add(new Signal("CROWDED", "포화", name, "이미 " + going + "건 시행 · 차별점 필요", 30 + (int) going, focus));
            }
        });

        IdeaTaxonomy.CONCEPTS.stream().filter(k -> !byNeed.containsKey(k.key()))
                .forEach(k -> out.add(new Signal("WHITESPACE", "빈칸", k.label(), "아직 아무도 시도하지 않았어요", 20, List.of())));

        out.sort(Comparator.comparingInt(Signal::score).reversed());
        return out;
    }
}
