package com.wolgyehoek.dongnae.media;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** 파일 앞부분 바이트로 형식을 판별한다. 브라우저가 보낸 Content-Type은 믿지 않는다. */
enum MediaType {
    JPEG("IMAGE", "image/jpeg", ".jpg"),
    PNG("IMAGE", "image/png", ".png"),
    GIF("IMAGE", "image/gif", ".gif"),
    WEBP("IMAGE", "image/webp", ".webp"),
    MP4("VIDEO", "video/mp4", ".mp4"),
    MOV("VIDEO", "video/quicktime", ".mov"),
    WEBM("VIDEO", "video/webm", ".webm");

    static final long MAX_IMAGE_BYTES = 10L * 1024 * 1024;
    static final long MAX_VIDEO_BYTES = 50L * 1024 * 1024;

    final String kind;
    final String contentType;
    final String extension;

    MediaType(String kind, String contentType, String extension) {
        this.kind = kind;
        this.contentType = contentType;
        this.extension = extension;
    }

    long maxBytes() {
        return kind.equals("IMAGE") ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    }

    static MediaType sniff(byte[] head) {
        if (starts(head, 0xFF, 0xD8, 0xFF)) return JPEG;
        if (starts(head, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) return PNG;
        if (ascii(head, 0, "GIF87a") || ascii(head, 0, "GIF89a")) return GIF;
        if (ascii(head, 0, "RIFF") && ascii(head, 8, "WEBP")) return WEBP;
        if (starts(head, 0x1A, 0x45, 0xDF, 0xA3)) return WEBM;
        if (ascii(head, 4, "ftyp") && head.length >= 12) {
            String brand = new String(Arrays.copyOfRange(head, 8, 12), StandardCharsets.US_ASCII);
            if (brand.equals("qt  ")) return MOV;
            if (Arrays.asList("isom", "iso2", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "dash", "M4V ", "MSNV", "3gp4", "3gp5").contains(brand)) return MP4;
        }
        return null;
    }

    private static boolean starts(byte[] head, int... bytes) {
        if (head.length < bytes.length) return false;
        for (int i = 0; i < bytes.length; i++) if ((head[i] & 0xFF) != bytes[i]) return false;
        return true;
    }

    private static boolean ascii(byte[] head, int offset, String text) {
        byte[] expected = text.getBytes(StandardCharsets.US_ASCII);
        if (head.length < offset + expected.length) return false;
        for (int i = 0; i < expected.length; i++) if (head[offset + i] != expected[i]) return false;
        return true;
    }

    static MediaType fromContentType(String contentType) {
        for (MediaType type : values()) if (type.contentType.equals(contentType)) return type;
        throw new IllegalStateException("알 수 없는 저장 형식: " + contentType);
    }
}
