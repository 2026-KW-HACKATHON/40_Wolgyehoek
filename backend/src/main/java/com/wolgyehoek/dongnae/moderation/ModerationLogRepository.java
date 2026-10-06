package com.wolgyehoek.dongnae.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, String> {
}