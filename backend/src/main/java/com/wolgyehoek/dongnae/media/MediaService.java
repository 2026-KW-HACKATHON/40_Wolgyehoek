package com.wolgyehoek.dongnae.media;

import com.wolgyehoek.dongnae.common.BadRequestException;
import com.wolgyehoek.dongnae.common.Ids;
import com.wolgyehoek.dongnae.common.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class MediaService {

    public static final int MAX_PER_CARD = 4;
    private static final String SELECT_VIEW = "SELECT id, kind, content_type FROM card_media ";

    private final JdbcTemplate db;
    private final Path dir;

    public MediaService(JdbcTemplate db, @Value("${dongnae.media.dir}") String dir) {
        this.db = db;
        this.dir = Path.of(dir).toAbsolutePath().normalize();
    }

    public record Stored(Resource resource, String contentType) {}

    @Transactional
    public MediaView upload(String deviceId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("올릴 파일을 골라 주세요.");
        MediaType type;
        try (InputStream in = file.getInputStream()) {
            type = MediaType.sniff(in.readNBytes(16));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        if (type == null) throw new BadRequestException("JPG·PNG·WEBP·GIF 사진이나 MP4·MOV·WEBM 영상만 올릴 수 있어요.");
        if (file.getSize() > type.maxBytes()) {
            throw new BadRequestException(type.kind.equals("IMAGE") ? "사진은 10MB 이하로 올려 주세요." : "영상은 50MB 이하로 올려 주세요.");
        }
        String id = Ids.newId();
        Path target = dir.resolve(id + type.extension);
        try {
            Files.createDirectories(dir);
            Path temp = Files.createTempFile(dir, id, ".part");
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, temp, StandardCopyOption.REPLACE_EXISTING);
            }
            Files.move(temp, target, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        db.update("INSERT INTO card_media(id, owner_device_id, kind, content_type, size_bytes) VALUES (?,?,?,?,?)",
                id, deviceId, type.kind, type.contentType, file.getSize());
        return new MediaView(id, type.kind, type.contentType);
    }

    /** 본인이 올린, 아직 어느 카드에도 연결되지 않은 파일만 카드에 붙일 수 있다. */
    @Transactional
    public void attach(String cardId, String ownerDeviceId, List<String> mediaIds) {
        if (mediaIds == null || mediaIds.isEmpty()) return;
        List<String> ids = new ArrayList<>(new LinkedHashSet<>(mediaIds));
        if (ids.size() > MAX_PER_CARD) throw new BadRequestException("사진·영상은 " + MAX_PER_CARD + "개까지 올릴 수 있어요.");
        for (int i = 0; i < ids.size(); i++) {
            int updated = db.update("UPDATE card_media SET card_id=?, position=? WHERE id=? AND owner_device_id=? AND card_id IS NULL",
                    cardId, i, ids.get(i), ownerDeviceId);
            if (updated != 1) throw new BadRequestException("첨부한 파일을 찾을 수 없어요. 다시 올려 주세요.");
        }
    }

    @Transactional(readOnly = true)
    public List<MediaView> forCard(String cardId) {
        return db.query(SELECT_VIEW + "WHERE card_id=? ORDER BY position", (rs, n) ->
                new MediaView(rs.getString("id"), rs.getString("kind"), rs.getString("content_type")), cardId);
    }

    @Transactional(readOnly = true)
    public Stored load(String id, String deviceId, boolean operator) {
        var rows = db.queryForList("""
                SELECT m.content_type, m.owner_device_id, m.card_id, c.hidden
                FROM card_media m LEFT JOIN cards c ON c.id = m.card_id WHERE m.id = ?
                """, id);
        if (rows.isEmpty()) throw new NotFoundException("파일을 찾을 수 없어요.");
        var row = rows.getFirst();
        boolean attached = row.get("card_id") != null;
        boolean visible = attached ? (!Boolean.TRUE.equals(row.get("hidden")) || operator) : deviceId.equals(row.get("owner_device_id"));
        if (!visible) throw new NotFoundException("파일을 찾을 수 없어요.");
        String contentType = (String) row.get("content_type");
        Path file = dir.resolve(id + MediaType.fromContentType(contentType).extension);
        if (!Files.isRegularFile(file)) throw new NotFoundException("파일을 찾을 수 없어요.");
        return new Stored(new FileSystemResource(file), contentType);
    }
}
