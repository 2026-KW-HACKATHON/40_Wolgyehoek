package com.wolgyehoek.dongnae.conclusion;

import com.wolgyehoek.dongnae.card.Decision;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conclusions")
public class Conclusion {

    @Id
    private String id;

    private String cardId;

    @Enumerated(EnumType.STRING)
    private Decision decision;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> reasonTags;

    private String reason;
    private String decidedBy;
    private Instant createdAt;

    protected Conclusion() {
    }

    public Conclusion(String id, String cardId, Decision decision,
                      List<String> reasonTags, String reason, String decidedBy) {
        this.id = id;
        this.cardId = cardId;
        this.decision = decision;
        this.reasonTags = new ArrayList<>(reasonTags);
        this.reason = reason;
        this.decidedBy = decidedBy;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getCardId() {
        return cardId;
    }

    public Decision getDecision() {
        return decision;
    }

    public List<String> getReasonTags() {
        return reasonTags;
    }

    public String getReason() {
        return reason;
    }

    public String getDecidedBy() {
        return decidedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}