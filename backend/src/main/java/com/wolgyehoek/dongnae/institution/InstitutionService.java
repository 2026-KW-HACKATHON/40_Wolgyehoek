package com.wolgyehoek.dongnae.institution;

import com.wolgyehoek.dongnae.card.CardNotFoundException;
import com.wolgyehoek.dongnae.card.CardRepository;
import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.ForbiddenException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.device.DeviceService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class InstitutionService {
    private final JdbcTemplate sql;
    private final DeviceService devices;
    private final CardRepository cards;
    private final SecureRandom random = new SecureRandom();
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public InstitutionService(JdbcTemplate sql, DeviceService devices, CardRepository cards) {
        this.sql = sql; this.devices = devices; this.cards = cards;
    }

    public record Institution(String id, String name) {}
    public record Created(String id, String name, String code) {}
    public record Linked(String name) {}
    public record Response(String institutionName, String stance, String comment, Instant createdAt) {}

    public Created create(String deviceId, String name) {
        requireOperator(deviceId);
        String clean = name == null ? "" : name.trim();
        if (clean.isEmpty() || clean.length() > 100) throw new BadRequestException("기관명은 1~100자로 적어 주세요.");
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 10; i++) code.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        String id = Ids.newId();
        try {
            sql.update("INSERT INTO institutions(id, name, code_hash) VALUES (?, ?, ?)", id, clean, hash(code.toString()));
        } catch (DuplicateKeyException e) {
            throw new BadRequestException("이미 등록된 기관명이에요.");
        }
        return new Created(id, clean, code.toString());
    }

    public List<Institution> list(String deviceId) {
        requireOperator(deviceId);
        return sql.query("SELECT id, name FROM institutions ORDER BY created_at DESC, id",
                (rs, row) -> new Institution(rs.getString("id"), rs.getString("name")));
    }

    public Linked enter(String deviceId, String code) {
        devices.getOrCreate(deviceId);
        String clean = code == null ? "" : code.trim();
        var found = sql.query("SELECT id, name FROM institutions WHERE code_hash = ?",
                (rs, row) -> new Institution(rs.getString("id"), rs.getString("name")), hash(clean));
        if (found.isEmpty()) throw new ForbiddenException("기관 코드가 맞지 않아요.");
        Institution institution = found.getFirst();
        sql.update("UPDATE devices SET institution_id = ? WHERE id = ?", institution.id(), deviceId);
        return new Linked(institution.name());
    }

    public Linked mine(String deviceId) {
        var found = sql.query("SELECT i.name FROM devices d JOIN institutions i ON i.id = d.institution_id WHERE d.id = ?",
                (rs, row) -> new Linked(rs.getString("name")), deviceId);
        return found.isEmpty() ? null : found.getFirst();
    }

    public void save(String cardId, String deviceId, String stance, String comment) {
        var institutionIds = sql.queryForList("SELECT institution_id FROM devices WHERE id = ? AND institution_id IS NOT NULL", String.class, deviceId);
        if (institutionIds.isEmpty()) throw new ForbiddenException("기관 코드를 먼저 입력해 주세요.");
        cards.findById(cardId).filter(c -> !c.isHidden()).orElseThrow(() -> new CardNotFoundException(cardId));
        if (stance == null || !Set.of("EMPATHY", "SUPPORT", "PARTNER").contains(stance)) throw new BadRequestException("기관 입장을 골라 주세요.");
        String clean = comment == null ? "" : comment.trim();
        if (clean.codePointCount(0, clean.length()) < 2 || clean.codePointCount(0, clean.length()) > 500) throw new BadRequestException("응답은 2~500자로 적어 주세요.");
        sql.update("""
                INSERT INTO institution_responses(id, card_id, institution_id, device_id, stance, comment)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (card_id, institution_id) DO UPDATE
                SET device_id = EXCLUDED.device_id, stance = EXCLUDED.stance, comment = EXCLUDED.comment, created_at = now()
                """, Ids.newId(), cardId, institutionIds.getFirst(), deviceId, stance, clean);
    }

    @Transactional(readOnly = true)
    public List<Response> responses(String cardId) {
        return sql.query("""
                SELECT i.name, r.stance, r.comment, r.created_at FROM institution_responses r
                JOIN institutions i ON i.id = r.institution_id WHERE r.card_id = ?
                ORDER BY r.created_at DESC, r.id
                """, (rs, row) -> new Response(rs.getString("name"), rs.getString("stance"), rs.getString("comment"),
                rs.getTimestamp("created_at").toInstant()), cardId);
    }

    private void requireOperator(String deviceId) {
        if (!devices.getOrCreate(deviceId).operator()) throw new ForbiddenException("운영자만 할 수 있어요.");
    }

    private String hash(String code) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(code.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
