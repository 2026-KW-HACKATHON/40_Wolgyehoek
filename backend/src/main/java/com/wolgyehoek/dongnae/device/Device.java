package com.wolgyehoek.dongnae.device;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    private String id;

    private String nickname;

    @Column(name = "is_operator")
    private boolean operator;

    private Instant createdAt;

    protected Device() {
    }

    public Device(String id, String nickname) {
        this.id = id;
        this.nickname = nickname;
        this.createdAt = Instant.now();
    }

    public void becomeOperator() {
        this.operator = true;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isOperator() {
        return operator;
    }

    public String getNickname() {
        return nickname;
    }

    public String getId() {
        return id;
    }
}
