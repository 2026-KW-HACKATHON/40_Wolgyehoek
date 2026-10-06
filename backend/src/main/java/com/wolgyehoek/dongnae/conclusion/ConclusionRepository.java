package com.wolgyehoek.dongnae.conclusion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConclusionRepository extends JpaRepository<Conclusion, String> {

    List<Conclusion> findByCardIdOrderByCreatedAtDesc(String cardId);
}