package com.wolgyehoek.dongnae.card;

import com.wolgyehoek.dongnae.device.DeviceCookieFilter;
import com.wolgyehoek.dongnae.device.DeviceInfo;
import com.wolgyehoek.dongnae.device.DeviceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestAttribute;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "01. 카드")
@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;
    private final DeviceService deviceService;

    public CardController(CardService cardService, DeviceService deviceService) {
        this.cardService = cardService;
        this.deviceService = deviceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse create(@Valid @RequestBody CreateCardRequest request,
                               @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId)
    {
        DeviceInfo device = deviceService.getOrCreate(deviceId);
        return cardService.create(request, device.id(), device.nickname());
    }

    @GetMapping
    public List<CardResponse> getAll() {
        return cardService.getAll();
    }

    @GetMapping("/{id}")
    public CardResponse get(@PathVariable String id,
                            @RequestAttribute(DeviceCookieFilter.ATTRIBUTE_NAME) String deviceId) {
        boolean operator = deviceService.getOrCreate(deviceId).operator();
        return cardService.get(id, operator);
    }
}
