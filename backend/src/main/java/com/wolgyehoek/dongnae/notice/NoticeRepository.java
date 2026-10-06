package com.wolgyehoek.dongnae.notice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, String> {

    List<Notice> findByCardId(String cardId);

    List<Notice> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
}