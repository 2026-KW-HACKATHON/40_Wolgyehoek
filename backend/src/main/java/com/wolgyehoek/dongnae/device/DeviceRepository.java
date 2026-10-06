package com.wolgyehoek.dongnae.device;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceRepository extends JpaRepository<Device, String> {
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "INSERT INTO devices (id, nickname, is_operator, created_at) VALUES (:id, :nickname, false, now()) ON CONFLICT (id) DO NOTHING", nativeQuery = true)
    void ensureDevice(@org.springframework.data.repository.query.Param("id") String id, @org.springframework.data.repository.query.Param("nickname") String nickname);
}
