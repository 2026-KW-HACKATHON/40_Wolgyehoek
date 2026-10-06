package com.wolgyehoek.dongnae.participation;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "09. 내 정보")
@RestController
public class ParticipationController {

    private final ParticipationService participationService;

    public ParticipationController(ParticipationService participationService) {
        this.participationService = participationService;
    }

    @GetMapping("/api/me/participation")
    public ParticipationResponse participation(@RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        return participationService.of(deviceId);
    }
}