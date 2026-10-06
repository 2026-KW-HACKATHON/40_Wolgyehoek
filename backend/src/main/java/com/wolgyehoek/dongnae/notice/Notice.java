package com.wolgyehoek.dongnae.notice;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "notices")
public class Notice {

    @Id
    private String id;

    private String deviceId;
    private String cardId;

    @Enumerated(EnumType.STRING)
    private NoticeKind kind;

    private Instant createdAt;
    private Instant readAt;

    protected Notice() {
    }

    public Notice(String id, String deviceId, String cardId, NoticeKind kind) {
        this.id = id;
        this.deviceId = deviceId;
        this.cardId = cardId;
        this.kind = kind;
        this.createdAt = Instant.now();
    }

    public void markRead(Instant now) {
        if (readAt == null) {
            readAt = now;
        }
    }

    public String getId() {
        return id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getCardId() {
        return cardId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public NoticeKind getKind() {
        return kind;
    }

    public Instant getReadAt() {
        return readAt;
    }
}