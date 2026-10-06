package com.wolgyehoek.dongnae.takeover;

import com.wolgyehoek.dongnae.card.CardResponse;
import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "06. 이어받기")
@RestController
@RequestMapping("/api/cards/{cardId}")
public class TakeoverController {

    private final TakeoverService takeoverService;
    private final DeviceService deviceService;

    public TakeoverController(TakeoverService takeoverService, DeviceService deviceService) {
        this.takeoverService = takeoverService;
        this.deviceService = deviceService;
    }

    @PostMapping("/takeover")
    @ResponseStatus(HttpStatus.CREATED)
    public TakeoverResponse takeOver(@PathVariable String cardId,
                                     @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId,
                                     @Valid @RequestBody TakeoverRequest request) {
        return takeoverService.takeOver(cardId, deviceService.getOrCreate(deviceId), request);
    }

    @GetMapping("/takeovers")
    public List<CardResponse> takeovers(@PathVariable String cardId) {
        return takeoverService.takeovers(cardId);
    }
}