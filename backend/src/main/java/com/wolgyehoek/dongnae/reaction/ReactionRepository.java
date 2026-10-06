package com.wolgyehoek.dongnae.reaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.util.List;

public interface ReactionRepository extends JpaRepository<Reaction, String> {

    List<Reaction> findByCardId(String cardId);

    Optional<Reaction> findByCardIdAndDeviceId(String cardId, String deviceId);

    long countByCardId(String cardId);

    List<Reaction> findByDeviceId(String deviceId);
}
