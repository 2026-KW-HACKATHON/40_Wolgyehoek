package com.wolgyehoek.dongnae.opinion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpinionRepository extends JpaRepository<Opinion, String> {

    List<Opinion> findByCardIdAndHiddenFalseOrderByCreatedAtDesc(String cardId);

    List<Opinion> findByCardId(String cardId);

    List<Opinion> findByDeviceId(String deviceId);

    boolean existsByIdAndHiddenFalse(String id);
}