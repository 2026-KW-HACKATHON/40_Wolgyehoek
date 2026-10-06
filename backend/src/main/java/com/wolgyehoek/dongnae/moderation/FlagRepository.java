package com.wolgyehoek.dongnae.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlagRepository extends JpaRepository<Flag, String> {

    boolean existsByTargetTypeAndTargetIdAndDeviceId(FlagTargetType targetType, String targetId, String deviceId);

    List<Flag> findByStatusOrderByCreatedAtAsc(FlagStatus status);

    List<Flag> findByTargetTypeAndTargetId(FlagTargetType targetType, String targetId);
}