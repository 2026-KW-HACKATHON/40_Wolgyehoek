package com.wolgyehoek.dongnae.moderation;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "07. 신고")
@RestController
public class FlagController {

    private final FlagService flagService;
    private final DeviceService deviceService;

    public FlagController(FlagService flagService, DeviceService deviceService) {
        this.flagService = flagService;
        this.deviceService = deviceService;
    }

    @PostMapping("/api/cards/{cardId}/flags")
    @ResponseStatus(HttpStatus.CREATED)
    public FlagResponse flagCard(@PathVariable String cardId,
                                 @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                 @Valid @RequestBody FlagRequest request) {
        return flagService.flagCard(cardId, deviceService.getOrCreate(deviceId), request.reason());
    }

    @PostMapping("/api/opinions/{opinionId}/flags")
    @ResponseStatus(HttpStatus.CREATED)
    public FlagResponse flagOpinion(@PathVariable String opinionId,
                                    @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                    @Valid @RequestBody FlagRequest request) {
        return flagService.flagOpinion(opinionId, deviceService.getOrCreate(deviceId), request.reason());
    }
}
