package com.wolgyehoek.dongnae.moderation;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "flags")
public class Flag {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    private FlagTargetType targetType;

    private String targetId;
    private String deviceId;
    private String reason;

    @Enumerated(EnumType.STRING)
    private FlagStatus status;

    private String note;
    private Instant createdAt;
    private Instant handledAt;

    protected Flag() {
    }

    public Flag(String id, FlagTargetType targetType, String targetId, String deviceId, String reason) {
        this.id = id;
        this.targetType = targetType;
        this.targetId = targetId;
        this.deviceId = deviceId;
        this.reason = reason;
        this.status = FlagStatus.OPEN;
        this.createdAt = Instant.now();
    }

    public void handle(FlagStatus result, String note, Instant now) {
        this.status = result;
        this.note = note;
        this.handledAt = now;
    }

    public String getId() {
        return id;
    }

    public FlagTargetType getTargetType() {
        return targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getReason() {
        return reason;
    }

    public FlagStatus getStatus() {
        return status;
    }

    public String getNote() {
        return note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getHandledAt() {
        return handledAt;
    }
}