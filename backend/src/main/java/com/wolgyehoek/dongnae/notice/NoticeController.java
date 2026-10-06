package com.wolgyehoek.dongnae.notice;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "09. 내 정보")
@RestController
@RequestMapping("/api/me/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping
    public List<NoticeResponse> list(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return noticeService.list(deviceId);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return noticeService.unreadCount(deviceId);
    }

    @PostMapping("/{noticeId}/read")
    public NoticeResponse markRead(@PathVariable String noticeId,
                                   @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return noticeService.markRead(noticeId, deviceId);
    }
}