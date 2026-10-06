package com.wolgyehoek.dongnae.reaction;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "reactions")
public class Reaction {

    @Id
    private String id;

    private String cardId;
    private String deviceId;

    private int step;
    private Integer price;
    private String respondentType;
    private Boolean geoInside;

    private Instant createdAt;
    private Instant updatedAt;

    protected Reaction() {
    }

    public Reaction(String id, String cardId, String deviceId,
                    int step, Integer price, String respondentType, Boolean geoInside) {
        this.id = id;
        this.cardId = cardId;
        this.deviceId = deviceId;
        this.step = step;
        this.price = price;
        this.respondentType = respondentType;
        this.geoInside = geoInside;
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void update(int step, Integer price, String respondentType, Boolean geoInside) {
        this.step = step;
        this.price = price;
        this.respondentType = respondentType;
        this.geoInside = geoInside;
        this.updatedAt = Instant.now();
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

    public int getStep() {
        return step;
    }

    public Integer getPrice() {
        return price;
    }

    public String getRespondentType() {
        return respondentType;
    }

    public Boolean getGeoInside() {
        return geoInside;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
