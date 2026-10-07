package com.wolgyehoek.dongnae.card;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    private String id;

    private String title;
    private String body;
    private String target;
    private String place;
    private String effect;

    private String proposerId;
    private String proposerName;

    private Instant startsAt;
    private Instant endsAt;

    private String parentId;
    private String takeoverNote;

    @Column(name = "is_seed")
    private boolean seed;
    private boolean hidden;

    private Instant reportPublishedAt;
    private String reportSummary;

    private String problem = "";
    private String topic = "";

    private int goal = 30;
    private Instant succeededAt;
    private String successNote;

    @Enumerated(EnumType.STRING)
    private Decision latestDecision;

    private Instant createdAt;

    protected Card() {
    }

    public Card(String id, String title, String body, String target, String place, String effect,
                String proposerId, String proposerName, Instant startsAt, Instant endsAt){
        this.id = id;
        this.title = title;
        this.body = body;
        this.target = target;
        this.place = place;
        this.effect = effect;
        this.proposerId = proposerId;
        this.proposerName = proposerName;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.createdAt = Instant.now();
    }

    public boolean isOpen(Instant now)
    {
        return status(now) == CardStatus.OPEN;
    }

    public CardStatus status(Instant now) {
        return CardStatus.of(endsAt, latestDecision, now);
    }

    public boolean isProposedBy(String deviceId) {
        return proposerId.equals(deviceId);
    }

    public boolean canBeManagedBy(String deviceId, boolean operator) {
        return operator || isProposedBy(deviceId);
    }

    public void conclude(Decision decision) {
        this.latestDecision = decision;
    }

    public void linkParent(String parentId, String takeoverNote) {
        this.parentId = parentId;
        this.takeoverNote = takeoverNote;
    }

    public Decision getLatestDecision() {
        return latestDecision;
    }

    public boolean isReportPublished() {
        return reportPublishedAt != null;
    }

    public void publishReport(String summary, Instant now) {
        this.reportSummary = summary;
        this.reportPublishedAt = now;
    }

    public void markSeed() { this.seed = true; }

    public void describeProblem(String problem, String topic) {
        this.problem = problem;
        this.topic = topic;
    }

    public String getProblem() {
        return problem;
    }

    public String getTopic() {
        return topic;
    }

    public void setGoal(int goal) {
        this.goal = goal;
    }

    /** 처음 목표에 닿은 순간만 성사로 기록한다. 이미 성사됐으면 false. */
    public boolean succeedIfReached(long pledges, Instant now) {
        if (succeededAt != null || pledges < goal) return false;
        this.succeededAt = now;
        return true;
    }

    public void announceSuccess(String note) {
        this.successNote = note;
    }

    public int getGoal() {
        return goal;
    }

    public Instant getSucceededAt() {
        return succeededAt;
    }

    public String getSuccessNote() {
        return successNote;
    }

    public void hide() {
        this.hidden = true;
    }

    public void closeNow(Instant now) {
        if (endsAt.isAfter(now)) {
            this.endsAt = now;
        }
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getTarget() {
        return target;
    }

    public String getPlace() {
        return place;
    }

    public String getEffect() {
        return effect;
    }

    public String getProposerId() {
        return proposerId;
    }

    public String getProposerName() {
        return proposerName;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public String getParentId() {
        return parentId;
    }

    public String getTakeoverNote() {
        return takeoverNote;
    }

    public boolean isSeed() {
        return seed;
    }

    public boolean isHidden() {
        return hidden;
    }

    public Instant getReportPublishedAt() {
        return reportPublishedAt;
    }

    public String getReportSummary() {
        return reportSummary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
