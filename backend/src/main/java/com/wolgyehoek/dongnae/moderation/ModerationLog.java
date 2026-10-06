package com.wolgyehoek.dongnae.moderation;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "moderation_logs")
public class ModerationLog {

    @Id
    private String id;

    private String actorDeviceId;

    @Enumerated(EnumType.STRING)
    private ModerationAction action;

    private String target;
    private String reason;
    private Instant createdAt;

    protected ModerationLog() {
    }

    public ModerationLog(String id, String actorDeviceId, ModerationAction action, String target, String reason) {
        this.id = id;
        this.actorDeviceId = actorDeviceId;
        this.action = action;
        this.target = target;
        this.reason = (reason == null) ? "" : reason;
        this.createdAt = Instant.now();
    }

    // Cmd + N → Getter → 전체 선택
}