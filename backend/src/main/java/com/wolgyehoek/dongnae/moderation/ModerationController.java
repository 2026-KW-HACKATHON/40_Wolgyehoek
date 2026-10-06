package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.card.CardResponse;
import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "08. 운영자")
@RestController
@RequestMapping("/api/operator")
public class ModerationController {

    private final ModerationService moderationService;
    private final DeviceService deviceService;

    public ModerationController(ModerationService moderationService, DeviceService deviceService) {
        this.moderationService = moderationService;
        this.deviceService = deviceService;
    }

    @GetMapping("/flags")
    public List<FlagResponse> openFlags(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return moderationService.openFlags(deviceService.getOrCreate(deviceId));
    }

    @PostMapping("/flags/{flagId}/hide")
    public FlagResponse hide(@PathVariable String flagId,
                             @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                             @Valid @RequestBody(required = false) ModerationRequest request) {
        return moderationService.hide(flagId, deviceService.getOrCreate(deviceId), note(request));
    }

    @PostMapping("/flags/{flagId}/keep")
    public FlagResponse keep(@PathVariable String flagId,
                             @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                             @Valid @RequestBody(required = false) ModerationRequest request) {
        return moderationService.keep(flagId, deviceService.getOrCreate(deviceId), note(request));
    }

    @PostMapping("/cards/{cardId}/close")
    public CardResponse close(@PathVariable String cardId,
                              @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return moderationService.closeNow(cardId, deviceService.getOrCreate(deviceId));
    }

    private String note(ModerationRequest request) {
        return (request == null) ? null : request.note();
    }
}