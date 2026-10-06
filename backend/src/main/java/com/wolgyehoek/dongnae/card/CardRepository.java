package com.wolgyehoek.dongnae.card;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, String> {
    List<Card> findByParentId(String parentId);
    List<Card> findByHiddenFalse();
    List<Card> findByProposerIdOrderByCreatedAtDesc(String proposerId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select c from Card c where c.id = :id")
    java.util.Optional<Card> findLockedById(@org.springframework.data.repository.query.Param("id") String id);

    boolean existsByIdAndHiddenFalse(String id);
}