package com.wolgyehoek.dongnae.card;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CardRepository extends JpaRepository<Card, String> {
    List<Card> findByParentId(String parentId);
    List<Card> findByHiddenFalse();
    List<Card> findByProposerIdOrderByCreatedAtDesc(String proposerId);

    boolean existsByIdAndHiddenFalse(String id);
}