package com.wolgyehoek.dongnae.media;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

@Tag(name = "카드 미디어")
@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService media;
    private final DeviceService devices;

    public MediaController(MediaService media, DeviceService devices) {
        this.media = media;
        this.devices = devices;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public MediaView upload(@RequestParam("file") MultipartFile file,
                            @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        devices.getOrCreate(deviceId);
        return media.upload(deviceId, file);
    }

    /** Resource를 그대로 돌려주면 Spring이 Range 요청(영상 탐색)을 처리한다. */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> get(@PathVariable String id,
                                        @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        boolean operator = devices.getOrCreate(deviceId).operator();
        MediaService.Stored stored = media.load(id, deviceId, operator);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(stored.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePrivate())
                .header("X-Content-Type-Options", "nosniff")
                .body(stored.resource());
    }
}
