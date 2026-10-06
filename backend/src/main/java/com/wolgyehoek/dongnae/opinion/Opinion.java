package com.wolgyehoek.dongnae.opinion;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "opinions")
public class Opinion {

    @Id
    private String id;

    private String cardId;
    private String deviceId;
    private String authorName;

    @Enumerated(EnumType.STRING)
    private Stance stance;

    private String body;
    private String condition;
    private boolean hidden;

    private Instant createdAt;

    protected Opinion() {
    }

    public Opinion(String id, String cardId, String deviceId, String authorName,
                   Stance stance, String body, String condition) {
        this.id = id;
        this.cardId = cardId;
        this.deviceId = deviceId;
        this.authorName = authorName;
        this.stance = stance;
        this.body = body;
        this.condition = condition;
        this.createdAt = Instant.now();
    }

    public void hide() {
        this.hidden = true;
    }

    public String getId() {
        return id;
    }

    public String getCardId() {
        return cardId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public Stance getStance() {
        return stance;
    }

    public String getBody() {
        return body;
    }

    public String getCondition() {
        return condition;
    }

    public boolean isHidden() {
        return hidden;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}